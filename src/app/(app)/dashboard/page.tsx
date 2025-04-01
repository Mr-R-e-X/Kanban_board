"use client";
import ProfilePage from "@/comonents/Account";
import AreUSureModal from "@/comonents/AreUSureModal";
import CreateSprintModal from "@/comonents/CreateSprint";
import CreateTaskModal from "@/comonents/CreateTaskModal";
import Dashboard from "@/comonents/Dashboard";
import DeleteSprint from "@/comonents/DeleteSprint";
import DetailedSprint from "@/comonents/DetailedSprint";
import EditSprintModal from "@/comonents/EditSprintModal";
import HandleTaskEdit from "@/comonents/HandleTaskEdit";
import Sidebar from "@/comonents/SideNav";
import { useAuth } from "@/context/AuthContext";
import { useMisc } from "@/context/MiscContext";
import { SprintProvider } from "@/context/SprintContext";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const page = () => {
  const { state: authState } = useAuth();
  const { state: miscState } = useMisc();

  const router = useRouter();

  useEffect(() => {
    if (!authState.isAuthenticated) {
      router.push("/");
    }
  }, []);
  if (!authState.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={130} className="animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <SprintProvider>
        <div className="flex-1 px-6 py-3 h-screen overflow-hidden">
          {miscState.activeContent === 0 && <Dashboard />}
          {miscState.activeContent === 1 && <ProfilePage />}
          {miscState.activeContent === 4 && <DetailedSprint />}
        </div>
        <EditSprintModal />
        <CreateSprintModal />
        <CreateTaskModal />
        <AreUSureModal />
        <HandleTaskEdit />
        <DeleteSprint />
      </SprintProvider>
    </div>
  );
};

export default page;
