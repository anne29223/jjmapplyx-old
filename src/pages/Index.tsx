import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Index: Effect triggered', { loading, user: !!user });
    if (!loading) {
      if (user) {
        console.log('Index: Navigating to dashboard');
        navigate("/dashboard");
      } else {
        console.log('Index: Navigating to auth');
        navigate("/auth");
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white' }}>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'white' }}>Loading JJMapplyx...</h1>
        <p className="text-xl opacity-80" style={{ color: '#e0e7ff' }}>Setting up your session...</p>
        <div className="mt-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;
