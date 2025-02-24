
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Text } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoginDialog } from "./LoginDialog";
import { NavLink, Link } from "react-router-dom";

interface User {
  id: string;         
  email: string;
  firstName: string;
  lastName?: string; 
  picture: string;
}
interface AuthResponse {
  access_token: string;
  user: User;
}

export const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  // const [user, setUser] = useState<User | null>(null);

  const { user, setUser, isLoading } = useAuth();
  const handleGoogleLogin = () => {
    // Open popup
    setShowLoginDialog(true);
  };

  console.log(user, 'check user from navbar');
  
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/';
    setUser(null);
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg border-b z-50"
    >
      <div className="container h-full mx-auto px-4 flex items-center justify-between">
      <Link to="/">
       
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2"
        >
            <Text className="w-8 h-8 text-slate-700" />
            <span className="text-xl font-semibold text-slate-700">TextWise</span>
        </motion.div>
          </Link>

        <div className="flex items-center space-x-6">
          {user && (
            <Link to="/analysis" className="nav-item">
              My Analysis
            </Link>
          )}
          
          {!user ? (
                <Button variant="outline" className="font-medium" onClick={handleGoogleLogin}>
                  Login
                </Button>

          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
              <Avatar className="hover:ring-2 ring-slate-200 transition-all">
    <AvatarImage 
      src={user?.picture} 
      alt={`${user?.firstName} ${user?.lastName}`}
      referrerPolicy="no-referrer"
      onError={(e) => {
        // Handle image load error
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
      }}
    />
    <AvatarFallback>
      {user?.firstName?.[0]}{user?.lastName?.[0]}
    </AvatarFallback>
  </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={handleLogout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <LoginDialog
        isOpen={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onLoginSuccess={() => {
          // Proceed with analysis after successful login
          // analyzeText();
        }}
      />
    </motion.nav>
  );
};
