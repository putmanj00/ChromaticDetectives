import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { GameProvider } from './lib/GameContext';
import HomeHub from './screens/HomeHub';

const Stage01Origin = React.lazy(() => import('./screens/Stage01Origin'));
const Stage02Hive = React.lazy(() => import('./screens/Stage02Hive'));
const Stage03Tuner = React.lazy(() => import('./screens/Stage03Tuner'));
const Stage04Gelato = React.lazy(() => import('./screens/Stage04Gelato'));
const Stage05Hierophany = React.lazy(() => import('./screens/Stage05Hierophany'));
const Stage06Minerals = React.lazy(() => import('./screens/Stage06Minerals'));
const Stage07Bridge = React.lazy(() => import('./screens/Stage07Bridge'));
const Stage08Gallery = React.lazy(() => import('./screens/Stage08Gallery'));
const Stage09Damascus = React.lazy(() => import('./screens/DamascusCipher'));
const Stage10Fog = React.lazy(() => import('./screens/Stage10Fog'));
const Stage11Apothecary = React.lazy(() => import('./screens/Stage11Apothecary'));
const Stage12Lego = React.lazy(() => import('./screens/Stage12Lego'));
const Stage13Mushrooms = React.lazy(() => import('./screens/Stage13Mushrooms'));
const Stage14Map = React.lazy(() => import('./screens/Stage14Map'));
const Stage15Omega = React.lazy(() => import('./screens/Stage15Omega'));
const WorldMap = React.lazy(() => import('./screens/WorldMap'));
const ItemsScreen = React.lazy(() => import('./screens/ItemsScreen'));
const ShardCollection = React.lazy(() => import('./screens/ShardCollection'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background-dark">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
      <span className="text-secondary font-mono text-xs tracking-widest">LOADING...</span>
    </div>
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <GameProvider>
        <ScrollToTop />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomeHub />} />
            <Route path="/map" element={<WorldMap />} />
            <Route path="/items" element={<ItemsScreen />} />
            <Route path="/stage-01" element={<Stage01Origin />} />
            <Route path="/stage-02" element={<Stage02Hive />} />
            <Route path="/stage-03" element={<Stage03Tuner />} />
            <Route path="/stage-04" element={<Stage04Gelato />} />
            <Route path="/stage-05" element={<Stage05Hierophany />} />
            <Route path="/stage-06" element={<Stage06Minerals />} />
            <Route path="/stage-07" element={<Stage07Bridge />} />
            <Route path="/stage-08" element={<Stage08Gallery />} />
            <Route path="/stage-09" element={<Stage09Damascus />} />
            <Route path="/stage-10" element={<Stage10Fog />} />
            <Route path="/stage-11" element={<Stage11Apothecary />} />
            <Route path="/stage-12" element={<Stage12Lego />} />
            <Route path="/stage-13" element={<Stage13Mushrooms />} />
            <Route path="/stage-14" element={<Stage14Map />} />
            <Route path="/stage-15" element={<Stage15Omega />} />
            <Route path="/shards" element={<ShardCollection />} />
          </Routes>
        </Suspense>
      </GameProvider>
    </HashRouter>
  );
};

export default App;
