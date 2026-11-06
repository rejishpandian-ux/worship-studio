import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { Navigation } from "./components/Navigation.jsx";
import { QuickMode } from "./components/QuickMode/QuickMode.jsx";
import { HomeOverview } from "./components/Home/HomeOverview.jsx";
import { PresentationStudio } from "./components/Editor/PresentationStudio.jsx";
import { ThemeGallery } from "./components/Themes/ThemeGallery.jsx";
import { ProjectLibrary } from "./components/Library/ProjectLibrary.jsx";
import { SettingsView } from "./components/Settings/SettingsView.jsx";
import { LivePresenter } from "./components/LivePresenter/LivePresenter.jsx";
import { AuthModal } from "./components/Auth/AuthModal.jsx";
import { ProfileModal } from "./components/Auth/ProfileModal.jsx";
import {
  getAllProjects,
  saveProject,
  deleteProject,
  createDefaultProject
} from "./db/indexedDb.js";

function WorshipStudioApp() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState("quick");
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem("worship-dark-mode");
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [project, setProject] = useState(() => createDefaultProject("Sunday Worship"));
  const [projects, setProjects] = useState([]);
  const [presenting, setPresenting] = useState(false);
  const [presentingSlideIndex, setPresentingSlideIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  // Auth Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState("signin");
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Sync dark mode class
  useEffect(() => {
    try {
      localStorage.setItem("worship-dark-mode", JSON.stringify(darkMode));
    } catch {}
  }, [darkMode]);

  // Load projects from IndexedDB
  const refreshProjects = async () => {
    try {
      const all = await getAllProjects();
      setProjects(all);
    } catch (e) {
      console.error("Failed to load projects:", e);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleOpenProject = (targetProject) => {
    setProject(targetProject);
    setCurrentView("editor");
    showToast(`Opened "${targetProject.title}"`);
  };

  const handleNewProject = () => {
    const fresh = createDefaultProject("Sunday Worship");
    setProject(fresh);
    setCurrentView("quick");
    showToast("Started fresh worship presentation");
  };

  const handleDeleteProject = async (id) => {
    try {
      await deleteProject(id);
      await refreshProjects();
      showToast("Presentation deleted");
    } catch {
      showToast("Failed to delete project");
    }
  };

  const handleDuplicateProject = async (targetProject) => {
    try {
      const duplicated = {
        ...targetProject,
        id: crypto.randomUUID ? crypto.randomUUID() : `proj_${Date.now()}`,
        title: `${targetProject.title} (Copy)`,
        updatedAt: new Date().toISOString()
      };
      await saveProject(duplicated);
      await refreshProjects();
      showToast(`Duplicated "${targetProject.title}"`);
    } catch {
      showToast("Failed to duplicate presentation");
    }
  };

  const handleSelectTheme = (themeId) => {
    const updated = {
      ...project,
      themeId,
      customImage: null,
      updatedAt: new Date().toISOString()
    };
    setProject(updated);
    saveProject(updated).catch(console.error);
    showToast("Theme applied to presentation");
    setCurrentView("editor");
  };

  const handleStartPresenting = (slideIdx = 0) => {
    setPresentingSlideIndex(slideIdx);
    setPresenting(true);
  };

  const handleOpenAuth = (view = "signin") => {
    setAuthModalView(view);
    setAuthModalOpen(true);
  };

  return (
    <div className={`app ${!darkMode ? "light" : ""}`}>
      {/* Sidebar & Top Navigation */}
      <Navigation
        currentView={currentView}
        setCurrentView={setCurrentView}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        projectCount={projects.length}
        themeCount={28}
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => setProfileModalOpen(true)}
        showToast={showToast}
      />

      {/* Main Content Area */}
      <main className="main">
        {currentView === "quick" && (
          <QuickMode
            project={project}
            setProject={setProject}
            setCurrentView={setCurrentView}
            onStartPresenting={handleStartPresenting}
            recentProjects={projects}
            onOpenProject={handleOpenProject}
            showToast={showToast}
          />
        )}

        {currentView === "home" && (
          <HomeOverview
            projects={projects}
            onOpenProject={handleOpenProject}
            onNewSong={handleNewProject}
            onOpenThemes={() => setCurrentView("themes")}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            showToast={showToast}
          />
        )}

        {currentView === "editor" && (
          <PresentationStudio
            project={project}
            setProject={setProject}
            onStartPresenting={handleStartPresenting}
            onOpenThemesView={() => setCurrentView("themes")}
            showToast={showToast}
          />
        )}

        {currentView === "themes" && (
          <ThemeGallery
            project={project}
            onSelectTheme={handleSelectTheme}
            onBack={() => setCurrentView("editor")}
            showToast={showToast}
          />
        )}

        {currentView === "library" && (
          <ProjectLibrary
            projects={projects}
            onOpenProject={handleOpenProject}
            onNewProject={handleNewProject}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            showToast={showToast}
          />
        )}

        {currentView === "settings" && (
          <SettingsView
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            project={project}
            onUpdateProject={(partial) => {
              const updated = { ...project, ...partial };
              setProject(updated);
              saveProject(updated).catch(console.error);
            }}
            showToast={showToast}
          />
        )}
      </main>

      {/* Fullscreen Live Presenter Overlay */}
      {presenting && (
        <LivePresenter
          project={project}
          initialSlideIndex={presentingSlideIndex}
          onClose={() => setPresenting(false)}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialView={authModalView}
        showToast={showToast}
      />

      {/* Profile & Workspace Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        showToast={showToast}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast">
          <Check size={14} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorshipStudioApp />
    </AuthProvider>
  );
}
