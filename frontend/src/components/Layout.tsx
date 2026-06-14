import React, { useState } from 'react';
import { 
  Sun, 
  BookOpen, 
  BarChart3, 
  CalendarDays, 
  Wind, 
  Sparkles, 
  Menu, 
  X, 
  AlertCircle
} from 'lucide-react';
import circleLogo from '../assets/balanceflow-circle-logo.png';

interface LayoutProps {
  children: React.ReactNode;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentTab, setCurrentTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'today', name: 'Today', icon: Sun },
    { id: 'library', name: 'Practice Library', icon: BookOpen },
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'report', name: 'Weekly Report', icon: CalendarDays },
    { id: 'breathing', name: 'Breathing', icon: Wind },
    { id: 'insights', name: 'AI Insights', icon: Sparkles },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      
      {/* Mobile Header */}
      <header className="glass-panel flex-between" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'between',
        padding: '12px 18px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderRadius: 0,
        borderBottom: '1px solid var(--panel-border)',
        backgroundColor: 'rgba(6, 10, 18, 0.8)',
        backdropFilter: 'blur(16px)',
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src={circleLogo} 
            alt="BalanceFlow Logo" 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              boxShadow: '0 0 10px rgba(20, 184, 166, 0.25)',
              border: '1px solid rgba(20, 184, 166, 0.2)',
              objectFit: 'contain'
            }}
          />
          <span style={{ 
            fontFamily: 'var(--font-headings)', 
            fontWeight: 700, 
            fontSize: '1.25rem',
            background: 'linear-gradient(to right, var(--color-beige), #fff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.03em'
          }}>
            BalanceFlow
          </span>
        </div>
        
        {/* Hamburger Trigger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Desktop Sidebar Navigation */}
        <aside className="glass-panel" style={{
          width: '260px',
          borderRadius: 0,
          borderTop: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
          borderRight: '1px solid var(--panel-border)',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 40,
          backgroundColor: 'rgba(6, 10, 18, 0.45)',
        }}>
          {/* Logo Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '28px', padding: '0 8px', width: '100%', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {/* Subtle Ambient Glow Backdrop */}
              <div style={{
                position: 'absolute',
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 100%)',
                filter: 'blur(8px)',
                zIndex: 0,
                pointerEvents: 'none'
              }} />
              <img 
                src={circleLogo} 
                alt="BalanceFlow Logo" 
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  boxShadow: '0 0 20px rgba(20, 184, 166, 0.2), 0 0 10px rgba(139, 92, 246, 0.15), 0 8px 24px rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(20, 184, 166, 0.2)',
                  objectFit: 'contain',
                  position: 'relative',
                  zIndex: 1
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <span style={{ 
                fontFamily: 'var(--font-headings)', 
                fontWeight: 700, 
                fontSize: '1.6rem',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: 'var(--color-beige)',
                textAlign: 'center'
              }}>
                BalanceFlow
              </span>
              <span style={{ 
                fontSize: '0.52rem', 
                color: 'var(--color-teal-light)', 
                fontWeight: 300,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                lineHeight: 1.4,
                opacity: 0.7,
                marginTop: '4px',
                textAlign: 'center'
              }}>
                Mindful Wellness<br />Companion
              </span>
            </div>
            <div style={{ 
              position: 'relative', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '100px', 
              height: '9px', 
              marginTop: '12px' 
            }}>
              {/* Gradient Line */}
              <div style={{ 
                width: '100%', 
                height: '1px', 
                background: 'linear-gradient(to right, transparent, rgba(20, 184, 166, 0.35), rgba(139, 92, 246, 0.35), transparent)' 
              }} />
              {/* Glowing Center Dot */}
              <div style={{ 
                position: 'absolute', 
                width: '4px', 
                height: '4px', 
                borderRadius: '50%', 
                backgroundColor: '#fff', 
                boxShadow: '0 0 6px rgba(20, 184, 166, 0.8), 0 0 2px rgba(139, 92, 246, 0.6)' 
              }} />
            </div>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid transparent',
                    background: isActive ? 'rgba(20, 184, 166, 0.08)' : 'transparent',
                    borderColor: isActive ? 'rgba(20, 184, 166, 0.15)' : 'transparent',
                    color: isActive ? 'var(--color-teal-light)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.95rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                    boxShadow: isActive ? 'var(--shadow-glow-teal)' : 'none'
                  }}
                  className={!isActive ? 'hover-nav-btn' : ''}
                >
                  <Icon size={18} style={{ color: isActive ? 'var(--color-teal-light)' : 'inherit' }} />
                  {item.name}
                  {item.id === 'insights' && (
                    <span className="badge badge-lavender" style={{ fontSize: '0.6rem', padding: '2px 6px', marginLeft: 'auto' }}>
                      AI
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Stats Summary / Mini Badge */}
          <div className="glass-panel" style={{ padding: '12px', borderRadius: '12px', marginTop: 'auto', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Companion Status
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-green-soft)', boxShadow: '0 0 6px var(--color-green-soft)' }}></div>
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Mindful & Active</span>
              </div>
              <img 
                src={circleLogo} 
                alt="BalanceFlow Logo" 
                style={{ 
                  width: '39px', 
                  height: '39px', 
                  opacity: 0.95, 
                  borderRadius: '50%', 
                  boxShadow: '0 0 10px rgba(20, 184, 166, 0.5), 0 0 4px rgba(20, 184, 166, 0.2)', 
                  border: '1px solid rgba(20, 184, 166, 0.35)',
                  objectFit: 'contain'
                }} 
              />
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              top: '57px',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(6, 10, 18, 0.8)',
              backdropFilter: 'blur(4px)',
              zIndex: 39,
              animation: 'fadeIn 0.2s ease-out'
            }}
          />
        )}
        
        {/* Mobile Drawer menu */}
        <div 
          className="glass-panel"
          style={{
            position: 'fixed',
            top: '57px',
            left: 0,
            right: 0,
            zIndex: 40,
            borderRadius: 0,
            borderLeft: 'none',
            borderRight: 'none',
            borderTop: 'none',
            borderBottom: '1px solid var(--panel-border)',
            padding: '16px',
            backgroundColor: 'rgba(6, 10, 18, 0.95)',
            backdropFilter: 'blur(24px)',
            transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(-110%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid transparent',
                  background: isActive ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
                  borderColor: isActive ? 'rgba(20, 184, 166, 0.2)' : 'transparent',
                  color: isActive ? 'var(--color-teal-light)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.95rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <Icon size={18} />
                {item.name}
                {item.id === 'insights' && (
                  <span className="badge badge-lavender" style={{ fontSize: '0.6rem', padding: '2px 6px', marginLeft: 'auto' }}>
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <main style={{ 
          flex: 1, 
          paddingLeft: '260px', /* Shift to avoid overlapping with fixed desktop sidebar */
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          boxSizing: 'border-box'
        }} className="main-content-responsive">
          <div style={{ flex: 1, paddingBottom: '40px' }}>
            {children}
          </div>

          {/* Footer Disclaimer */}
          <footer style={{
            padding: '24px',
            borderTop: '1px solid var(--panel-border)',
            textAlign: 'center',
            backgroundColor: 'rgba(6, 10, 18, 0.2)',
          }}>
            <div style={{ 
              maxWidth: '800px', 
              margin: '0 auto', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '8px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <AlertCircle size={14} style={{ color: 'var(--color-lavender)' }} />
                <span>Disclaimer: BalanceFlow is a self-guided personal companion.</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                All recommendations, insights, and summaries are generated based on your logged trends for reflection. 
                This tool is not intended for diagnostic purposes, medical therapy, or clinical support.
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                © {new Date().getFullYear()} BalanceFlow. Mindful tools for a calm life.
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Style overrides for responsive layout */}
      <style>{`
        @media (max-width: 768px) {
          header.flex-between {
            display: flex !important;
          }
          aside {
            display: none !important;
          }
          .main-content-responsive {
            padding-left: 0 !important;
          }
        }
        @media (min-width: 769px) {
          header.flex-between {
            display: none !important;
          }
        }
        .hover-nav-btn:hover {
          background: rgba(255, 255, 255, 0.03) !important;
          color: var(--text-primary) !important;
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
};
