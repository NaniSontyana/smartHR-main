import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Settings, Bell, ChevronDown, LogOut, User as UserIcon, Menu, Activity, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { logout, getNotifications, markNotificationAsRead, getProfile } from "@/services/api";
import { getSocket } from "@/services/socket";

const navLinks = [
  { name: "Dashboard", path: "/" },
  { name: "Reports", path: "/reports" },
  { name: "Employees", path: "/employees" },
  { name: "Predict", path: "/predict" },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({ name: "User", role: "Employee", initials: "U" });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) { console.error("Failed to parse user", e); }
    }

    if (token) {
        getProfile().then(data => {
            const fullUser = {
                name: data.username || data.email.split('@')[0],
                role: data.role,
                email: data.email,
                phone: data.phone,
                department: data.department,
                avatar: data.avatar,
                initials: (data.username || data.email).charAt(0).toUpperCase()
            };
            setUser(fullUser);
            localStorage.setItem("user", JSON.stringify(fullUser));
        }).catch(err => console.error("Could not background fetch profile"));
    }

    // Real-Time WebSocket notifications
    const socket = getSocket();
    const handleLiveNotification = (notif) => {
      setNotifications(prev => [
        {
          id: notif.id || `notif_${Date.now()}`,
          name: notif.name || notif.employeeName || "HR Alert",
          message: notif.message,
          time: notif.time || "Just now",
          read: false
        },
        ...prev
      ]);
      toast.warning(notif.message || `New alert received`);
    };

    socket.on("notification:new", handleLiveNotification);

    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        if (Array.isArray(data)) {
          setNotifications(data.map(n => ({
            id: n._id,
            name: n.employeeName,
            message: n.message,
            time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: n.read
          })));
        }
      } catch (err) {
        console.warn("Could not fetch notifications:", err);
      }
    };

    const handleProfileUpdate = () => {
      const updatedUser = localStorage.getItem("user");
      if (updatedUser) {
        try { setUser(JSON.parse(updatedUser)); } catch (e) {}
      }
    };

    fetchNotifications();

    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => {
        socket.off("notification:new", handleLiveNotification);
        window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, []);

  const handleMarkAsRead = async (id) => {
    await markNotificationAsRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };


  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-card/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-foreground">RetainIQ</span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded uppercase font-mono">
                  v2.4
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground hidden sm:block font-medium">Workforce Retention Intelligence</p>
            </div>
          </Link>

          {/* Telemetry live beacon */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/40 dark:bg-slate-950/60 border border-border/60 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">ML Inference: Online • 14ms</span>
          </div>

          {/* Navigation - Only show if authenticated */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Mobile Navigation - Only show if authenticated */}
          {isAuthenticated && (
            <div className="md:hidden flex items-center">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground mr-2">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                  <div className="flex flex-col gap-6 py-4">
                    <div className="flex items-center gap-2 px-2">
                       <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <span className="text-lg font-bold">S</span>
                      </div>
                      <span className="text-xl font-bold text-foreground">SmartHR</span>
                    </div>
                    <nav className="flex flex-col gap-2">
                      {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                          >
                            {link.name}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Search */}
              <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9 bg-muted border-0"
                />
              </div>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-muted-foreground mr-1">
                    <Bell className="h-5 w-5" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-card"></span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="font-medium text-base">Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className={`p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors ${!notif.read ? 'bg-primary/5' : ''}`} onClick={() => handleMarkAsRead(notif.id)}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-semibold">{notif.name}</span>
                            <span className="text-xs text-muted-foreground">{notif.time}</span>
                          </div>
                          <p className="text-xs text-foreground/80 line-clamp-2">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Switcher */}
              <ThemeToggle />

              {/* Icons */}
              <Link to="/settings">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 lg:gap-3 cursor-pointer group p-1 pr-2 rounded-full transition-all duration-200 hover:bg-muted/80">
                    <div className="relative">
                      <Avatar className="h-9 w-9 lg:h-10 lg:w-10 border-2 border-transparent group-hover:border-primary/50 transition-all duration-300 shadow-sm">
                        {user.avatar ? (
                            <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
                        ) : (
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}&backgroundColor=b6e3f4`} alt={user.name} />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-card hidden lg:block"></span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0 shadow-xl border-border">
                  {/* Detailed Popup View */}
                  <div className="flex flex-col items-center justify-center p-6 pb-5 bg-gradient-to-b from-primary/10 to-transparent border-b border-border">
                    <Avatar className="h-20 w-20 border-4 border-card shadow-sm mb-3">
                        {user.avatar ? (
                            <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
                        ) : (
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}&backgroundColor=b6e3f4`} alt={user.name} />
                        )}
                        <AvatarFallback className="text-2xl font-bold bg-primary/20 text-primary">{user.initials}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold text-foreground leading-tight text-center">{user.name}</h3>
                    <div className="mt-1.5 flex items-center justify-center">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            {user.role}
                        </span>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4 bg-card/50">
                      <div className="flex flex-col space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Email Account</span>
                          <span className="text-sm font-medium text-foreground">{user.email || "Loading..."}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col space-y-1">
                              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Department</span>
                              <span className="text-sm font-medium text-foreground">{user.department || "Not specified"}</span>
                          </div>
                          
                          <div className="flex flex-col space-y-1">
                              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Phone</span>
                              <span className="text-sm font-medium text-foreground">{user.phone || "Not specified"}</span>
                          </div>
                      </div>
                  </div>

                  <DropdownMenuSeparator className="m-0 border-border" />
                  
                  <div className="p-2 bg-card rounded-b-md">
                      <Link to="/settings" className="block outline-none">
                          <DropdownMenuItem className="cursor-pointer py-2.5 font-medium transition-colors hover:bg-muted focus:bg-muted">
                             <Settings className="mr-2.5 h-4 w-4 text-muted-foreground" />
                             <span>Manage Profile Settings</span>
                          </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-50 focus:bg-red-600 cursor-pointer py-2.5 font-medium mt-1 transition-colors">
                        <LogOut className="mr-2.5 h-4 w-4" />
                        <span>Secure Log Out</span>
                      </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
