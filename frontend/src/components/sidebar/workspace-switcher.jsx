import {ChevronsUpDown, Plus, Settings, UsersRound} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx"
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,} from "@/components/ui/sidebar.jsx"
import {useWorkspaceStore} from "@/stores/workspace-store.js";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.jsx";
import {Link, useNavigate, useParams} from "react-router-dom";
import {toast} from "sonner";
import {useEffect} from "react";
import {fetchAndSetCurrentMember, fetchAndSetWorkspaces} from "@/lib/fetch-and-set-methods.js";
import {Button} from "@/components/ui/button.jsx";
import {useAuthStore} from "@/stores/auth-store.js";


export function WorkspaceSwitcher() {
    const {isMobile} = useSidebar()
    const {wsId} = useParams()
    const currentMember = useAuthStore(state => state.member)
    const workspaces = useWorkspaceStore(state => state.workspaces)
    const activeWorkspace = useWorkspaceStore(state => state.activeWorkspace)
    const setActiveWorkspace = useWorkspaceStore(state => state.setActiveWorkspace)
    const setMembers = useWorkspaceStore(state => state.setActiveMembers)
    const setProjects = useWorkspaceStore(state => state.setActiveProjects)
    const clearDraftStore = useWorkspaceStore(state => state.clearStore)
    const navigate = useNavigate()


    const handleSwitch = async (workspace) => {
        if (workspace?.id !== activeWorkspace?.id) {
            setMembers(null)
            setProjects(null)
            clearDraftStore()
            setActiveWorkspace(workspace)
            navigate(`/workspaces/${workspace?.id}/projects`)
        }
    }

    useEffect(() => {
        try {
            fetchAndSetWorkspaces()
            fetchAndSetCurrentMember()
        } catch (e) {
            toast.error(e?.response?.data?.detail || String(e) || "Failed to fetch workspaces/current-member")
        }
    }, [wsId, activeWorkspace]);


    if (!activeWorkspace) {
        return null
    }

    return (<SidebarMenu>
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-back data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarFallback className="rounded-lg">{activeWorkspace?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{activeWorkspace?.name}</span>
                        </div>
                        <ChevronsUpDown className="ml-auto"/>
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                {workspaces &&
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-max rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuItem className="gap-2 p-2 hover:bg-transparent! flex flex-col justify-start items-start">
                            <div className="flex items-center justify-start gap-2">
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg">{activeWorkspace?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{activeWorkspace?.name}</span>
                                </div>
                            </div>
                            <div className="w-full mt-2 flex flex-wrap items-center justify-start gap-2">
                                {
                                    currentMember?.role === "admin" && (
                                        <Button
                                            variant="ghost"
                                            className="pl-2!"
                                            asChild
                                        >
                                            <Link
                                                to={`../${activeWorkspace?.id}/settings/workspace`}
                                                className="text-muted-foreground"
                                            >
                                                <Settings/>
                                                Settings
                                            </Link>
                                        </Button>
                                    )
                                }
                                <Button
                                    variant="ghost"
                                    className="pl-2!"
                                    asChild
                                >
                                    <Link
                                        to={`../${activeWorkspace?.id}/settings/workspace/members`}
                                        className="text-muted-foreground"
                                    >
                                        <UsersRound/>
                                        Members
                                    </Link>
                                </Button>
                            </div>
                        </DropdownMenuItem>

                        {
                            workspaces && workspaces?.length > 1 &&
                            (
                                <>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuLabel className="text-muted-foreground text-xs">
                                        Workspaces
                                    </DropdownMenuLabel>
                                </>
                            )
                        }
                        {workspaces?.map((space) => (
                            <DropdownMenuItem
                                key={space?.id}
                                onClick={() => handleSwitch(space)}
                                className={`gap-2 p-2 ${space?.id === activeWorkspace?.id && "hidden!"}`}
                            >
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarFallback className="rounded-lg">{space?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="text-nowrap text-ellipsis overflow-x-hidden!">{space?.name}</span>
                            </DropdownMenuItem>))}
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem
                            className="gap-2 p-2"
                            asChild
                        >
                            <Link to="../new-workspace">
                                <div
                                    className="flex size-6 items-center justify-center rounded-md border bg-transparent"
                                >
                                    <Plus className="size-4"/>
                                </div>
                                <div className="text-muted-foreground font-medium">Add workspace</div>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>}

            </DropdownMenu>
        </SidebarMenuItem>
    </SidebarMenu>);
}
