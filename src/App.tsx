import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import LineItemSettings from './pages/LineItemSettings';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/settings" element={<LineItemSettings />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;