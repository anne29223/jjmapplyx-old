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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading JJMapplyx...</h1>
        <p className="text-muted-foreground">Setting up your session...</p>
      </div>
    </div>
  );
};

export default Index;
