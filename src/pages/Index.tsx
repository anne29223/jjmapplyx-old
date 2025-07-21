import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Job Ninja...</h1>
        <p className="text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default Index;
