import { Camera, User, ScanFace, Maximize } from "lucide-react";

export const PONTOS_DE_VISTA = [
    { id: "selfie", enum: "SELFIE", label: "Selfie (POV)", desc: "Câmera na mão, como uma selfie", icon: Camera },
    { id: "frontal", enum: "FRONTAL", label: "Frontal", desc: "Câmera de frente, à altura dos olhos", icon: User },
    { id: "close-up", enum: "CLOSE_UP", label: "Close-up", desc: "Aproximado no rosto e no produto", icon: ScanFace },
    { id: "wide", enum: "WIDE", label: "Plano aberto", desc: "Mostra o ambiente ao redor", icon: Maximize },
];