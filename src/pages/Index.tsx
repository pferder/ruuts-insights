import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// Mantenemos la página Index como está, pero agregando ProtectedRoute
const Index = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome to the dashboard!</p>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Index;
