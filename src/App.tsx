import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './integrations/supabase/client';
import Index from './pages/Index';
import LineItemSettings from './pages/LineItemSettings';
import Login from './pages/Login';
import { Toaster } from './components/ui/toaster';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', session);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            session ? <Navigate to="/" replace /> : <Login />
          }
        />
        <Route
          path="/"
          element={
            session ? <Index /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/settings"
          element={
            session ? <LineItemSettings /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;