export * from './database';

// Common UI Types
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface AuthModalProps extends ModalProps {
    mode: 'login' | 'signup';
    onModeSwitch: () => void;
}

// Evaluation Form Types
export interface EvaluationFormData {
    uxScore: number;
    usefulnessScore: number;
    reliabilityScore: number;
    dataHandlingScore: number;
    clarityScore: number;
    comments: string;
}

// Dashboard Stats Types
export interface DashboardStats {
    totalApps: number;
    pendingEvaluations: number;
    completedEvaluations: number;
    averageScore: number;
}

// Navigation Item Type
export interface NavItem {
    name: string;
    path: string;
    icon: string;
}
