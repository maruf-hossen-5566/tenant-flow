import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
    createBrowserRouter,
    createRoutesFromElements,
    Navigate,
    Route,
    RouterProvider,
} from "react-router-dom";
import "./index.css";
import Base from "../base.jsx";
import Layout from "@/components/layouts/layout.jsx";
import Home from "@/components/home/home.jsx";
import SignupPage from "@/components/custom/auth/signup.jsx";
import LoginPage from "@/components/custom/auth/login.jsx";
import WorkspaceLayout from "@/components/layouts/workspace-layout.jsx";
import Projects from "@/components/workspace/projects.jsx";
import ProtectedRoute from "@/components/custom/auth/protected-route.jsx";
import NewWorkspace from "@/components/workspace/new-workspace.jsx";
import Workspaces from "@/components/workspace/workspaces.jsx";
import Members from "@/components/workspace/members.jsx";
import Views from "@/components/workspace/views.jsx";
import { Details as ProjectDetails } from "@/components/workspace/project/details.jsx";
import { Tasks as ProjectTasks } from "@/components/workspace/project/tasks.jsx";
import { Members as ProjectMembers } from "@/components/workspace/project/members.jsx";
import SettingsLayout from "@/components/layouts/settings-layout.jsx";
import Account from "@/components/settings/account/account.jsx";
import Security from "@/components/settings/account/security.jsx";
import Workspace from "@/components/settings/workspace/workspace.jsx";
import PageNotFound from "@/components/others/page-not-found.jsx";
import WorkspaceMembers from "@/components/settings/workspace/workspace-members.jsx";
import PendingInvites from "@/components/settings/workspace/pending-invites.jsx";
import AcceptInvites from "@/components/workspace/accept-invites.jsx";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Base />}>
            <Route path="" element={<Layout />}>
                <Route index element={<Home />} />
            </Route>

            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />

            <Route path="workspaces" element={<ProtectedRoute />}>
                <Route index element={<Workspaces />} />
                <Route path="new-workspace" element={<NewWorkspace />} />
                <Route path="invitation" element={<AcceptInvites />} />
                <Route path=":wsId/settings" element={<SettingsLayout />}>
                    {/* Account */}
                    <Route index element={<Account />} />
                    <Route path="security" element={<Security />} />
                    {/* Workspace */}
                    <Route path="workspace" element={<Workspace />} />
                    <Route
                        path="workspace/members"
                        element={<WorkspaceMembers />}
                    />
                    <Route
                        path="workspace/pending-invites"
                        element={<PendingInvites />}
                    />
                </Route>

                <Route path=":wsId" element={<WorkspaceLayout />}>
                    <Route
                        index
                        element={<Navigate to={"projects"} replace />}
                    />
                    <Route path="projects" element={<Projects />} />
                    <Route path="tasks" element={<Views />} />
                    <Route path="members" element={<Members />} />
                    <Route
                        path="projects/:projectId"
                        element={<ProjectDetails />}
                    />
                    <Route
                        path="projects/:projectId/tasks"
                        element={<ProjectTasks />}
                    />
                    <Route
                        path="projects/:projectId/members"
                        element={<ProjectMembers />}
                    />
                </Route>
            </Route>
            <Route path="*" element={<PageNotFound />} />
        </Route>,
    ),
);

createRoot(document.getElementById("root")).render(
    <RouterProvider router={router} />,
    // <StrictMode>
    // </StrictMode>,
);
