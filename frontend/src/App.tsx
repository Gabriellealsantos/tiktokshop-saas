import { Routes, Route } from "react-router-dom";
import { PrivateRoute } from "@/components/private-route";
import { Toaster, CustomCursor } from "@/components";

import IndexRoute from "@/routes/home";
import LoginRoute from "@/routes/login";
import RegisterRoute from "@/routes/register";
import ForgotPasswordRoute from "@/routes/forgot-password";
import RecoverPasswordRoute from "@/routes/recover-password";
import AuthorizedRoute from "@/routes/authorized";
import AccessPendingRoute from "@/routes/access-pending";
import DashboardRoute from "@/routes/dashboard";
import AdminScreen from "@/routes/admin";
import NotFoundRoute from "@/routes/not-found";
import TermsRoute from "@/routes/terms";
import AvatarStudio from "@/routes/create-avatar";
import CreditsScreen from "@/routes/credits";
import EditorScreen from "@/routes/editor";
import ProductTemplatesPicker from "@/routes/generate/viral-template";
import ProductsScreen from "@/routes/products";
import ProfileScreen from "@/routes/profile";
import PromptsScreen from "@/routes/prompts";
import ReferralScreen from "@/routes/referral";
import SettingsScreen from "@/routes/settings";

import TemplatesScreen from "@/routes/templates";
import TemplateAssemblyScreen from "@/routes/templates/use-template";
import ToolsScreen from "@/routes/tools";
import TrendLanding from "@/routes/trend-boost";
import TrendTemplateDetail from "@/routes/trend-boost/template-detail";
import TrendCharacterFlow from "@/routes/trend-boost/character-flow";
import CreateFromScratchScreen from "@/routes/create-from-scratch";
import PoseScreen from "@/routes/create-from-scratch/pose";
import ScenarioScreen from "@/routes/create-from-scratch/scenario";
import SpeechScreen from "@/routes/create-from-scratch/speech";
import VideoScreen from "./routes/create-from-scratch/video";

function App() {
  return (
    <>
      <CustomCursor />
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register" element={<RegisterRoute />} />
        <Route path="/forgot-password" element={<ForgotPasswordRoute />} />
        <Route path="/recover-password/:token" element={<RecoverPasswordRoute />} />
        <Route path="/authorized" element={<AuthorizedRoute />} />
        <Route path="/acesso-pendente" element={<AccessPendingRoute />} />
        <Route path="/termos-de-uso" element={<TermsRoute />} />
        <Route path="*" element={<NotFoundRoute />} />

        <Route element={<PrivateRoute />}>
          <Route path="/" element={<IndexRoute />} />
          <Route path="/dashboard" element={<DashboardRoute />} />
          <Route path="/admin" element={<AdminScreen />} />
          <Route path="/create-avatar" element={<AvatarStudio />} />
          <Route path="/credits" element={<CreditsScreen />} />
          <Route path="/editor" element={<EditorScreen />} />
          <Route
            path="/generate/viral-template"
            element={<ProductTemplatesPicker />}
          />
          <Route path="/products" element={<ProductsScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/prompts" element={<PromptsScreen />} />
          <Route path="/referral" element={<ReferralScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />

          <Route path="/templates" element={<TemplatesScreen />} />
          <Route path="/templates/use" element={<TemplateAssemblyScreen />} />
          <Route path="/tools" element={<ToolsScreen />} />
          <Route path="/trend-boost" element={<TrendLanding />} />
          <Route
            path="/trend-boost/:template"
            element={<TrendTemplateDetail />}
          />
          <Route
            path="/trend-boost/:template/:characterId"
            element={<TrendCharacterFlow />}
          />
          <Route
            path="/create-from-scratch"
            element={<CreateFromScratchScreen />}
          />
          <Route path="/create-from-scratch/pose" element={<PoseScreen />} />
          <Route
            path="/create-from-scratch/scenario"
            element={<ScenarioScreen />}
          />
          <Route
            path="/create-from-scratch/speech"
            element={<SpeechScreen />}
          />
          <Route path="/create-from-scratch/video" element={<VideoScreen />} />
        </Route>
      </Routes>
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
