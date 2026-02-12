import React from 'react';
import { RecentSalesView } from './views/recent-sales';
import { TopSalesView } from './views/top-sales';
import { SplashModal } from './widgets/splash-modal';
import { Header } from './views/header';
import { SalesConnnectorContext } from '../context/sales-connector';
import { SaleRecord, TopSeller } from './types';
import type { SalesEvent } from '../services/messages';

export const DashBoardView = () => {
	const { hub, store } = React.useContext(SalesConnnectorContext);
  
	// Controls which view is shown: 'top' sellers or 'recent' sales.
    // The UI switches automatically between these two.
  	const [mode, setMode] = React.useState<"top" | "recent">("top");

  	// Stores the 10 most recent sales (newest first).
  	const [recentSales, setRecentSales] = React.useState<SaleRecord[]>([]);

  	// Keeps track of how much each user has sold in total.
  	// Used to calculate the top 10 sellers.
  	const [totalsByUser, setTotalsByUser] = React.useState<Record<number, TopSeller>>({});

  	// The sale currently shown in the splash/toast notification.
  	// If null, no splash is visible.
  	const [activeSplash, setActiveSplash] = React.useState<SaleRecord | null>(null,);

  	// Simple counter used to generate unique IDs for table rows.
  	const saleIdRef = React.useRef(1);

  	// Queue of incoming sale events.
  	// Ensures events are processed in the order they arrive.
  	const eventQueueRef = React.useRef<SalesEvent[]>([]);

  	// Prevents multiple queue processors from running at the same time.
  	const processingRef = React.useRef(false);

  	// Queue for splash notifications.
  	// Ensures each splash is shown one at a time for 5 seconds.
  	const splashQueueRef = React.useRef<SaleRecord[]>([]);

  	// Stores the current splash timer ID.
  	// Used to know if a splash is active and to clean up properly.
  	const splashTimerRef = React.useRef<number | null>(null);

	
	// Starts processing the splash queue.
	// Ensures only one splash is shown at a time.
	const startSplashQueue = React.useCallback(() => {

		 // If a splash timer is already running, do nothing.
         // This prevents multiple splashes from overlapping.
		if (splashTimerRef.current !== null) {
			return;
		}
		// Get the next sale in the queue (without removing it yet).
		const next = splashQueueRef.current[0]; 

		if (!next) {
			return;
		}
		
		// This triggers the SplashModal to render in the UI.
		setActiveSplash(next);

		splashTimerRef.current = window.setTimeout(() => {
			splashQueueRef.current.shift(); // Remove the sale we just showed
			splashTimerRef.current = null; // Cleanup
			setActiveSplash(null); // Hide splash in UI
			startSplashQueue(); // Show next sale (if any)
		}, 5000); // 5 seconds
	}, []); 

	// Single queue worker: enrich events, compute value, update leaderboard and recent list.
	const processEventQueue = React.useCallback(async () => {
		if (processingRef.current) {
			return;
		}
		processingRef.current = true;

		while (eventQueueRef.current.length > 0) {
			const e = eventQueueRef.current.shift();
			try {
				const [user, product] = await Promise.all([
					store.getUser(e.userId),
					store.getProduct(e.productId),
				]);

				const value = Number((product.unitPrice * e.duration).toFixed(2));
				const sale: SaleRecord = {
					id: saleIdRef.current++,
					user,
					product,
					duration: e.duration,
					value,
					timestamp: Date.now(),
				};

				// Keep recent sales capped at 10 entries (newest first).
				setRecentSales((prev) => [sale, ...prev].slice(0, 10));

				// Increment seller total so top sellers can be derived efficiently.
				setTotalsByUser((prev) => {
					const existing = prev[user.id];
					const total = (existing?.total || 0) + value;
					return {
						...prev,
						[user.id]: { user, total },
					};
				});

				// Queue splash display in arrival order.
				splashQueueRef.current.push(sale);
				startSplashQueue();
			} catch (error) {
				console.error('Failed to process sale event', error);
			}
		}

		processingRef.current = false;
		if (eventQueueRef.current.length > 0) {
			void processEventQueue();
		}
	}, [startSplashQueue, store]);

	React.useEffect(() => {
		// Subscribe to live sales stream when component mounts.
		const cb = (e) => {
			eventQueueRef.current.push(e);
			void processEventQueue();
		}

		hub.registerSalesEventListener(cb)
		return () => hub.unregisterSalesEventListener(cb)
	}, [hub, processEventQueue]);

	React.useEffect(() => {
		// Challenge timing: top sellers for 60s, recent sales for 30s.
		const timeout = window.setTimeout(() => {
			setMode((prev) => (prev === 'top' ? 'recent' : 'top'));
		}, mode === 'top' ? 60000 : 30000);

		return () => window.clearTimeout(timeout); // stop the old timer and start a new one
	}, [mode]);

	React.useEffect(() => {
		// Prevent dangling timeout if view is unmounted.
		return () => {
			if (splashTimerRef.current !== null) {
				window.clearTimeout(splashTimerRef.current);
			}
		};
	}, []);

	//  top sellers from totals map and keep only the first 10.
	const topSellers = React.useMemo(() => {
		return Object.values(totalsByUser)
			.sort((a, b) => b.total - a.total)
			.slice(0, 10);
	}, [totalsByUser]);

	return (
		<>
			<div className="flex-auto p-5">
				<Header />
				{/* Render only one mode at a time based on timer-driven state. */}
				{mode === 'recent' ?
					<RecentSalesView sales={recentSales} />
					: <TopSalesView sellers={topSellers} />
				}

				{/* Splash/toast is visible only while activeSplash is set. */}
				<SplashModal sale={activeSplash} />
			</div>
		</>
	)
}
