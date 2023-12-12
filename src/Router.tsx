import { Routes, Route, Router } from "@solidjs/router";
import { lazy } from "solid-js";

import Layout from "~components/Layout/Layout";
import OfflinePrompt from "~components/OfflinePrompt/OfflinePrompt";

const Acknowledgments = lazy(() => import("./pages/acknowledgments"));
const Home = lazy(() => import("./pages/home/index"));

export default function AppRouter() {
	return (
		<Router>
			<Layout>
				<Routes>
					<Route path="/acknowledgments" component={Acknowledgments} />
					<Route path="*" component={Home} />
				</Routes>

				<OfflinePrompt />
			</Layout>
		</Router>
	);
}
