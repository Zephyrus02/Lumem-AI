"use client";

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence,
} from "framer-motion";
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  FileText,
  Server,
  MessageSquare,
  Settings,
  LogIn,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useUser,
  useClerk,
  UserButton,
  SignInButton,
} from "@clerk/clerk-react";

const DOCK_HEIGHT = 128;
const DEFAULT_MAGNIFICATION = 80;
const DEFAULT_DISTANCE = 150;
const DEFAULT_PANEL_HEIGHT = 64;

type DockProps = {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  panelHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};
type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
};
type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
};
type DockIconProps = {
  className?: string;
  children: React.ReactNode;
};

type DocContextType = {
  mouseX: MotionValue;
  spring: SpringOptions;
  magnification: number;
  distance: number;
};
type DockProviderProps = {
  children: React.ReactNode;
  value: DocContextType;
};

const DockContext = createContext<DocContextType | undefined>(undefined);

function DockProvider({ children, value }: DockProviderProps) {
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error("useDock must be used within an DockProvider");
  }
  return context;
}

function Dock({
  children,
  className,
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxHeight = useMemo(() => {
    return Math.max(DOCK_HEIGHT, magnification + magnification / 2 + 4);
  }, [magnification]);

  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div
      style={{
        height: height,
        scrollbarWidth: "none",
      }}
      className="mx-2 flex max-w-full items-end overflow-x-auto"
    >
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={cn(
          "mx-auto flex w-fit gap-4 rounded-2xl bg-gray-50 px-4 dark:bg-neutral-900",
          className
        )}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        <DockProvider value={{ mouseX, spring, distance, magnification }}>
          {children}
        </DockProvider>
      </motion.div>
    </motion.div>
  );
}

// Modify the DockItem function to track click state:

function DockItem({
  children,
  className,
  onClick,
  isActive = false,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { distance, magnification, mouseX, spring } = useDock();
  const isHovered = useMotionValue(0);
  // Add this state to track if item was clicked
  const [isClicked, setIsClicked] = useState(false);

  const mouseDistance = useTransform(mouseX, (val) => {
    const domRect = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - domRect.x - domRect.width / 2;
  });

  const widthTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [40, magnification, 40]
  );

  const width = useSpring(widthTransform, spring);

  // Handle click on dock item
  const handleClick = () => {
    setIsClicked(true);
    // Reset click state after a delay
    setTimeout(() => setIsClicked(false), 2000);
    // Call the original onClick handler
    onClick?.();
  };

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={handleClick}
      className={cn(
        "relative inline-flex items-center justify-center cursor-pointer",
        className
      )}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, (child) =>
        cloneElement(child as React.ReactElement<any>, { width, isHovered, isClicked })
      )}

      {isActive && (
        <motion.div
          layoutId="dock-indicator"
          initial={{ width: 4, height: 4, borderRadius: 999 }}
          animate={{ width: 16, height: 4, borderRadius: 999 }}
          exit={{ width: 4, height: 4 }}
          transition={{
            type: "linear",
            stiffness: 300,
            damping: 20,
          }}
          className="absolute bottom-2.5 bg-white"
        />
      )}
    </motion.div>
  );
}

function DockLabel({ children, className, ...rest }: DockLabelProps) {
  const restProps = rest as Record<string, unknown>;
  const isHovered = restProps["isHovered"] as MotionValue<number>;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = isHovered.on("change", (latest) => {
      setIsVisible(latest === 1);
    });

    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white",
            className
          )}
          role="tooltip"
          style={{ x: "-50%" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className, ...rest }: DockIconProps) {
  const restProps = rest as Record<string, unknown>;
  const width = restProps["width"] as MotionValue<number>;

  const widthTransform = useTransform(width, (val) => val / 2);

  return (
    <motion.div
      style={{ width: widthTransform }}
      className={cn("flex items-center justify-center", className)}
    >
      {children}
    </motion.div>
  );
}

// Add this new component for the separator
function DockSeparator() {
  return (
    <div
      className="mx-2 h-8 w-px self-center bg-white/20"
      role="separator"
      aria-orientation="vertical"
    />
  );
}

function AppDock() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useUser();
  const { openSignIn } = useClerk();

  return (
    <Dock className="bg-black/30 backdrop-blur-md border border-white/10">
      <DockItem onClick={() => navigate("/")} isActive={currentPath === "/"}>
        <DockIcon>
          <Home className="h-6 w-6 text-neutral-200" />
        </DockIcon>
        <DockLabel className="bg-black/80 text-white border-neutral-800">
          Home
        </DockLabel>
      </DockItem>

      <DockItem
        onClick={() => navigate("/docs")}
        isActive={currentPath === "/docs"}
      >
        <DockIcon>
          <FileText className="h-6 w-6 text-neutral-200" />
        </DockIcon>
        <DockLabel className="bg-black/80 text-white border-neutral-800">
          Documentation
        </DockLabel>
      </DockItem>

      <DockItem
        onClick={() => navigate("/connect")}
        isActive={currentPath === "/connect"}
      >
        <DockIcon>
          <Server className="h-6 w-6 text-neutral-200" />
        </DockIcon>
        <DockLabel className="bg-black/80 text-white border-neutral-800">
          Connect LLMs
        </DockLabel>
      </DockItem>

      <DockItem
        onClick={() => navigate("/chat")}
        isActive={currentPath === "/chat"}
      >
        <DockIcon>
          <MessageSquare className="h-6 w-6 text-neutral-200" />
        </DockIcon>
        <DockLabel className="bg-black/80 text-white border-neutral-800">
          Chat with AI
        </DockLabel>
      </DockItem>

      <DockItem
        onClick={() => navigate("/settings")}
        isActive={currentPath === "/settings"}
      >
        <DockIcon>
          <Settings className="h-6 w-6 text-neutral-200" />
        </DockIcon>
        <DockLabel className="bg-black/80 text-white border-neutral-800">
          Settings
        </DockLabel>
      </DockItem>

      {/* Add vertical separator */}
      <DockSeparator />

      {/* Sign in/Profile button */}
      <DockItem
        onClick={() => {
          if (!user) {
            openSignIn(); // Opens Clerk sign-in modal
          }
          // No navigation for logged in users - the UserButton will handle its own clicks
        }}
        isActive={currentPath === "/profile"}
      >
        <DockIcon>
          {user ? (
            <div onClick={(e) => e.stopPropagation()}>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    rootBox: 'h-6 w-6',
                    avatarBox: 'h-6 w-6'
                  }
                }}
              />
            </div>
          ) : (
            <LogIn className="h-6 w-6 text-neutral-200" />
          )}
        </DockIcon>
        <DockLabel className="bg-black/80 text-white border-neutral-800">
          {user ? "Profile" : "Sign In"}
        </DockLabel>
      </DockItem>
    </Dock>
  );
}

// Update the exports to include the new component
export { Dock, DockIcon, DockItem, DockLabel, DockSeparator, AppDock };
