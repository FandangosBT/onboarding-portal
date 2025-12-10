import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGate, TermGate, PasswordGate } from '../components/guards';
import { Login } from '../pages/Login';
import { Termo } from '../pages/Termo';
import { Dashboard } from '../pages/Dashboard';
import { Onboarding } from '../pages/Onboarding';
import { Financeiro } from '../pages/Financeiro';
import { Reunioes } from '../pages/Reunioes';
import { CRM } from '../pages/CRM';
import { Calendario } from '../pages/Calendario';
import { Shell } from '../components/Shell';
import { Avisos } from '../pages/Avisos';
import { ChangePassword } from '../pages/ChangePassword';
import { Usuarios } from '../pages/Usuarios';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/trocar-senha"
          element={
            <AuthGate>
              <ChangePassword />
            </AuthGate>
          }
        />
        <Route
          path="/termo"
          element={
            <AuthGate>
              <PasswordGate>
                <Termo />
              </PasswordGate>
            </AuthGate>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AuthGate>
              <PasswordGate>
                <TermGate>
                  <Shell>
                    <Dashboard />
                  </Shell>
                </TermGate>
              </PasswordGate>
            </AuthGate>
          }
        />
        <Route
          path="/onboarding"
          element={
            <AuthGate>
              <PasswordGate>
                <TermGate>
                  <Shell>
                    <Onboarding />
                  </Shell>
                </TermGate>
              </PasswordGate>
            </AuthGate>
          }
        />
        <Route
          path="/financeiro"
          element={
            <AuthGate>
              <PasswordGate>
                <TermGate>
                  <Shell>
                    <Financeiro />
                  </Shell>
                </TermGate>
              </PasswordGate>
            </AuthGate>
          }
        />
        <Route
          path="/reunioes"
          element={
            <AuthGate>
              <PasswordGate>
                <TermGate>
                  <Shell>
                    <Reunioes />
                  </Shell>
                </TermGate>
              </PasswordGate>
            </AuthGate>
          }
        />
        <Route
          path="/crm"
          element={
            <AuthGate>
              <PasswordGate>
                <TermGate>
                  <Shell>
                    <CRM />
                  </Shell>
                </TermGate>
              </PasswordGate>
            </AuthGate>
          }
        />
        <Route
          path="/calendario"
          element={
            <AuthGate>
              <PasswordGate>
                <TermGate>
                  <Shell>
                    <Calendario />
                  </Shell>
                </TermGate>
              </PasswordGate>
            </AuthGate>
          }
        />
        <Route
          path="/avisos"
          element={
            <AuthGate>
              <PasswordGate>
                <TermGate>
                  <Shell>
                    <Avisos />
                  </Shell>
                </TermGate>
              </PasswordGate>
            </AuthGate>
          }
        />
        <Route
          path="/usuarios"
          element={
            <AuthGate>
              <PasswordGate>
                <TermGate>
                  <Shell>
                    <Usuarios />
                  </Shell>
                </TermGate>
              </PasswordGate>
            </AuthGate>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
