import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";

interface LoginDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: () => void;
}

export const LoginDialog = ({ 
  isOpen,
  onOpenChange,
  onLoginSuccess,
}: LoginDialogProps) => {
  const { setUser } = useAuth();

  const handleGoogleLogin = () => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      `${import.meta.env.VITE_API_URL}/auth/google`,
      'Google Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    window.addEventListener('message', (event) => {
      // if (event.origin !== import.meta.env.VITE_API_URL) return;
      console.log(event.data, 'event.data');
      if (event.data.type === 'AUTH_SUCCESS') {
        const authResponse = event.data.data;
        
        localStorage.setItem('access_token', authResponse.access_token);
        setUser(authResponse.user);
        
        if (popup) popup.close();
        onOpenChange(false);
        onLoginSuccess?.();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login Required</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-6">
          <p className="text-center text-muted-foreground mb-4">
            Please login to continue with this action
          </p>
          <Button
            variant="outline"
            className="w-full max-w-sm flex items-center justify-center space-x-2"
            onClick={handleGoogleLogin}
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-4 h-4"
            />
            <span>Continue with Google</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};