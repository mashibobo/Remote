
import React from "react";
import { RemoteProvider } from "@/context/RemoteContext";
import Dashboard from "@/components/Dashboard";

const Index: React.FC = () => {
  return (
    <RemoteProvider>
      <Dashboard />
    </RemoteProvider>
  );
};

export default Index;
