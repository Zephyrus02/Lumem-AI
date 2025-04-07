'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ChevronRight,
  ChevronDown,
  Settings,
  ArrowLeft,
  Search,
  X,
  Sliders,
  Keyboard,
  Shield,
  Info,
  ChevronLeft,
} from 'lucide-react';
import { AppDock } from './dock';

// Types for our settings data
type Category = {
  id: string;
  title: string;
  icon: React.ReactNode;
  sections: Section[];
};

type Section = {
  id: string;
  title: string;
  content: React.ReactNode;
};

// Prebuilt settings data
const settingsData: Category[] = [
  {
    id: 'features',
    title: 'Features',
    icon: <Sliders className="h-4 w-4 mr-2" />,
    sections: [
      {
        id: 'ai-assistant',
        title: 'AI Assistant',
        content: (
          <div>
            <h2 className="text-2xl font-bold mb-4">AI Assistant Settings</h2>
            <p className="mb-6 text-white/60">
              Configure how the AI assistant works throughout your workflow.
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 w-full mx-auto relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-purple-500/[0.03] rounded-xl -z-10" />
              
              <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">Enable AI Suggestions</label>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white/60">Receive intelligent suggestions as you work</p>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-indigo-400 translate-x-6 transition-transform"></span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">Completion Level</label>
                    <div className="relative">
                      <select className="w-full bg-black/60 border border-white/10 rounded-md px-3 py-2.5 text-white/80 
                        appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent
                        transition-all duration-200">
                        <option>Conservative</option>
                        <option>Balanced</option>
                        <option>Aggressive</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                    </div>
                    <p className="text-xs text-neutral-500">How proactive should AI suggestions be</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">Model Selection</label>
                    <div className="relative">
                      <select className="w-full bg-black/60 border border-white/10 rounded-md px-3 py-2.5 text-white/80 
                        appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent
                        transition-all duration-200">
                        <option>Claude 3.7 Sonnet</option>
                        <option>GPT-4o</option>
                        <option>Anthropic Claude 3 Opus</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                    </div>
                    <p className="text-xs text-neutral-500">Select which AI model powers your experience</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ),
      },
      {
        id: 'editor',
        title: 'Editor',
        content: (
          <div>
            <h2 className="text-2xl font-bold mb-4">Editor Preferences</h2>
            <p className="mb-6 text-white/60">
              Customize how the code editor behaves and appears.
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 w-full mx-auto relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-rose-500/[0.03] rounded-xl -z-10" />
              
              <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">Font Size</label>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white/60">Adjust the editor font size</p>
                      <div className="flex items-center space-x-3">
                        <button className="bg-black/60 border border-white/10 w-8 h-8 rounded-md flex items-center justify-center text-white/80 hover:bg-black/80 transition-colors">
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-white/80 min-w-[40px] text-center">14px</span>
                        <button className="bg-black/60 border border-white/10 w-8 h-8 rounded-md flex items-center justify-center text-white/80 hover:bg-black/80 transition-colors">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">Theme</label>
                    <div className="relative">
                      <select className="w-full bg-black/60 border border-white/10 rounded-md px-3 py-2.5 text-white/80 
                        appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent
                        transition-all duration-200">
                        <option>Dark (Default)</option>
                        <option>Light</option>
                        <option>Contrast</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                    </div>
                    <p className="text-xs text-neutral-500">Color theme for the code editor</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">Tab Size</label>
                    <div className="relative">
                      <select className="w-full bg-black/60 border border-white/10 rounded-md px-3 py-2.5 text-white/80 
                        appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent
                        transition-all duration-200">
                        <option>2 spaces</option>
                        <option>4 spaces</option>
                        <option>8 spaces</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                    </div>
                    <p className="text-xs text-neutral-500">Number of spaces for each tab character</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">Word Wrap</label>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white/60">Wrap text to stay within the editor width</p>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-indigo-400 translate-x-6 transition-transform"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ),
      },
      {
        id: 'interface',
        title: 'Interface',
        content: (
          <div>
            <h2 className="text-2xl font-bold mb-4">Interface Settings</h2>
            <p className="mb-6 text-white/60">
              Configure the appearance and behavior of the application interface.
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 w-full mx-auto relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] to-indigo-500/[0.03] rounded-xl -z-10" />
              
              <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">Dock Position</label>
                    <div className="relative">
                      <select className="w-full bg-black/60 border border-white/10 rounded-md px-3 py-2.5 text-white/80 
                        appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent
                        transition-all duration-200">
                        <option>Bottom</option>
                        <option>Left</option>
                        <option>Right</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                    </div>
                    <p className="text-xs text-neutral-500">Where the application dock should appear</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">Animations</label>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white/60">Enable or disable UI animations</p>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-indigo-400 translate-x-6 transition-transform"></span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">Accent Color</label>
                    <p className="text-xs text-neutral-500 mb-2">Choose a color theme for the application</p>
                    <div className="flex items-center space-x-3">
                      <button className="h-10 w-10 rounded-full bg-indigo-500 border-2 border-white/30 hover:scale-110 transition-transform"></button>
                      <button className="h-10 w-10 rounded-full bg-rose-500 border-2 border-transparent hover:scale-110 transition-transform"></button>
                      <button className="h-10 w-10 rounded-full bg-emerald-500 border-2 border-transparent hover:scale-110 transition-transform"></button>
                      <button className="h-10 w-10 rounded-full bg-amber-500 border-2 border-transparent hover:scale-110 transition-transform"></button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ),
      },
    ],
  },
  {
    id: 'keybindings',
    title: 'Keybindings',
    icon: <Keyboard className="h-4 w-4 mr-2" />,
    sections: [
      {
        id: 'editor-keybindings',
        title: 'Editor Shortcuts',
        content: (
          <div>
            <h2 className="text-2xl font-bold mb-4">Editor Keyboard Shortcuts</h2>
            <p className="mb-6 text-white/60">
              Customize keyboard shortcuts for the code editor.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-2 md:col-span-1">
                <h3 className="text-lg font-bold mb-2">Navigation</h3>
                <div className="bg-black/40 rounded-md p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Go to Line</span>
                    <div>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">Ctrl</span>
                      <span className="text-white/50 mx-1">+</span>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">G</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Go to Symbol</span>
                    <div>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">Ctrl</span>
                      <span className="text-white/50 mx-1">+</span>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">Shift</span>
                      <span className="text-white/50 mx-1">+</span>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">O</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Go to File</span>
                    <div>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">Ctrl</span>
                      <span className="text-white/50 mx-1">+</span>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">P</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <h3 className="text-lg font-bold mb-2">Editing</h3>
                <div className="bg-black/40 rounded-md p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Comment Line</span>
                    <div>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">Ctrl</span>
                      <span className="text-white/50 mx-1">+</span>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">/</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Format Document</span>
                    <div>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">Shift</span>
                      <span className="text-white/50 mx-1">+</span>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">Alt</span>
                      <span className="text-white/50 mx-1">+</span>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">F</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Rename Symbol</span>
                    <div>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">F2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-6 w-full mx-auto relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-violet-500/[0.03] rounded-xl -z-10" />
              
              <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h4 className="font-semibold mb-2">Customize Shortcuts</h4>
                <p className="mb-4 text-white/60">
                  You can customize any keyboard shortcut by clicking on the shortcut and pressing your preferred key combination.
                </p>
                <button className="bg-gradient-to-r from-indigo-500 to-purple-600 
                  hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md 
                  transition-all duration-300">
                  Edit Shortcuts
                </button>
              </div>
            </motion.div>
          </div>
        ),
      },
      {
        id: 'app-keybindings',
        title: 'Application Shortcuts',
        content: (
          <div>
            <h2 className="text-2xl font-bold mb-4">Application Keyboard Shortcuts</h2>
            <p className="mb-6 text-white/60">
              Global shortcuts for navigating and controlling the application.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-2 md:col-span-1">
                <h3 className="text-lg font-bold mb-2">Application</h3>
                <div className="bg-black/40 rounded-md p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Settings</span>
                    <div>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">Ctrl</span>
                      <span className="text-white/50 mx-1">+</span>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">,</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Toggle Dock</span>
                    <div>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">Ctrl</span>
                      <span className="text-white/50 mx-1">+</span>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">B</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Toggle Full Screen</span>
                    <div>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">F11</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <h3 className="text-lg font-bold mb-2">AI Assistant</h3>
                <div className="bg-black/40 rounded-md p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Trigger AI Suggestion</span>
                    <div>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">Alt</span>
                      <span className="text-white/50 mx-1">+</span>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">\\</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Generate Comment</span>
                    <div>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">Ctrl</span>
                      <span className="text-white/50 mx-1">+</span>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">Alt</span>
                      <span className="text-white/50 mx-1">+</span>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">C</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Generate Tests</span>
                    <div>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">Ctrl</span>
                      <span className="text-white/50 mx-1">+</span>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">Alt</span>
                      <span className="text-white/50 mx-1">+</span>
                      <span className="bg-white/10 px-2 py-1 rounded text-white/90">T</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    icon: <Shield className="h-4 w-4 mr-2" />,
    sections: [
      {
        id: 'data-collection',
        title: 'Data Collection',
        content: (
          <div>
            <h2 className="text-2xl font-bold mb-4">Data Collection Settings</h2>
            <p className="mb-6 text-white/60">
              Control what data is collected and how it's used.
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 w-full mx-auto relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-amber-500/[0.03] rounded-xl -z-10" />
              
              <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">Telemetry Data</label>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white/60">Share anonymous usage data to help improve the application</p>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-indigo-400 translate-x-6 transition-transform"></span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">AI Training</label>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white/60">Allow your interactions to be used for improving AI models</p>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-neutral-400 translate-x-1 transition-transform"></span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">Crash Reports</label>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white/60">Automatically send crash reports to help fix issues</p>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-indigo-400 translate-x-6 transition-transform"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-6 w-full mx-auto relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.03] to-orange-500/[0.03] rounded-xl -z-10" />
              
              <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-rose-500/20 p-6">
                <h4 className="font-semibold mb-2">Data Removal</h4>
                <p className="mb-4 text-white/60">
                  You can request the deletion of all your personal data from our servers.
                </p>
                <button className="relative overflow-hidden group bg-gradient-to-r from-rose-500 to-red-600 
                  hover:from-rose-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-md 
                  transition-all duration-300">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-rose-400/0 via-white/20 to-rose-400/0 
                    opacity-0 group-hover:opacity-100 transform translate-x-[-100%] group-hover:translate-x-[100%] 
                    transition-all duration-1000"></div>
                  Request Data Deletion
                </button>
              </div>
            </motion.div>
          </div>
        ),
      },
      {
        id: 'security',
        title: 'Security',
        content: (
          <div>
            <h2 className="text-2xl font-bold mb-4">Security Settings</h2>
            <p className="mb-6 text-white/60">
              Manage your account security and login preferences.
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 w-full mx-auto relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-emerald-500/[0.03] rounded-xl -z-10" />
              
              <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">Two-Factor Authentication</label>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white/60">Add an extra layer of security to your account</p>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-neutral-400 translate-x-1 transition-transform"></span>
                      </div>
                    </div>
                    <button className="bg-gradient-to-r from-indigo-500 to-purple-600 
                      hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md 
                      transition-all duration-300 mt-2">
                      Enable 2FA
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">Session Timeout</label>
                    <div className="relative">
                      <select className="w-full bg-black/60 border border-white/10 rounded-md px-3 py-2.5 text-white/80 
                        appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent
                        transition-all duration-200">
                        <option>30 minutes</option>
                        <option>1 hour</option>
                        <option>4 hours</option>
                        <option>Never</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                    </div>
                    <p className="text-xs text-neutral-500">How long until you're automatically logged out</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-6 w-full mx-auto relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/[0.03] to-sky-500/[0.03] rounded-xl -z-10" />
              
              <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-bold mb-3">Devices & Sessions</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-white/10">
                    <div>
                      <div className="font-medium">MacBook Pro - Chrome</div>
                      <div className="text-xs text-white/60">Current session · San Francisco, CA</div>
                    </div>
                    <span className="bg-green-500/20 text-green-200 text-xs px-2 py-1 rounded-full">Active</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/10">
                    <div>
                      <div className="font-medium">iPhone 15 Pro - Safari</div>
                      <div className="text-xs text-white/60">Last active: Apr 5, 2025 · San Francisco, CA</div>
                    </div>
                    <button className="text-rose-400 text-xs hover:underline">Revoke</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ),
      },
    ],
  },
  {
    id: 'about',
    title: 'About',
    icon: <Info className="h-4 w-4 mr-2" />,
    sections: [
      {
        id: 'app-info',
        title: 'Application Info',
        content: (
          <div>
            <h2 className="text-2xl font-bold mb-4">About Lumen</h2>

            <div className="flex flex-col items-center justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-2xl flex items-center justify-center mb-4">
                <div className="text-white text-4xl font-bold">L</div>
              </div>
              <h3 className="text-xl font-bold">Lumen AI Code Assistant</h3>
              <p className="text-white/60">Version 1.2.0 (Build 2042)</p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 w-full mx-auto relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-purple-500/[0.03] rounded-xl -z-10" />
              
              <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <p className="mb-4 text-white/80">
                  Lumen is an AI-powered coding environment designed to enhance developer productivity and creativity through intelligent assistance.
                </p>
                
                <div className="bg-black/40 rounded-md p-4 mb-4">
                  <h3 className="font-bold mb-2">System Information</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">OS:</span>
                      <span>macOS 14.5.1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Memory:</span>
                      <span>16 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Processor:</span>
                      <span>Apple M2 Pro</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2">Credits</h3>
                  <p className="text-white/60 mb-1">Developed by the Lumen Team</p>
                  <p className="text-white/60 mb-4">© 2025 Lumen AI, Inc. All rights reserved.</p>
                  
                  <div className="flex space-x-4">
                    <button className="relative overflow-hidden group bg-gradient-to-r from-indigo-500 to-purple-600 
                      hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md 
                      transition-all duration-300">
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-400/0 via-white/20 to-indigo-400/0 
                        opacity-0 group-hover:opacity-100 transform translate-x-[-100%] group-hover:translate-x-[100%] 
                        transition-all duration-1000"></div>
                      Check for Updates
                    </button>
                    <button className="bg-black/60 border border-white/10 hover:bg-black/80 text-white/80 px-4 py-2 rounded-md text-sm transition-colors">
                      View Licenses
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ),
      },
      {
        id: 'whats-new',
        title: "What's New",
        content: (
          <div>
            <h2 className="text-2xl font-bold mb-4">What's New in Lumen</h2>
            <p className="mb-6 text-white/60">
              Latest features, improvements, and bug fixes.
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full mx-auto relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-cyan-500/[0.03] rounded-xl -z-10" />
              
              <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="text-xl font-bold mr-2">Version 1.2.0</span>
                      <span className="bg-indigo-500/20 text-indigo-200 text-xs px-2 py-1 rounded-full">Current</span>
                    </div>
                    <p className="text-white/60 text-sm mb-3">Released: April 2, 2025</p>
                    
                    <ul className="list-disc pl-6 space-y-3">
                      <li>
                        <span className="font-medium">Enhanced AI Code Generation</span>
                        <p className="text-white/60 text-sm mt-1">Improved code suggestions with context-aware completions across multiple files</p>
                      </li>
                      <li>
                        <span className="font-medium">Real-time Collaboration</span>
                        <p className="text-white/60 text-sm mt-1">Work with team members simultaneously on the same project with live cursors and changes</p>
                      </li>
                      <li>
                        <span className="font-medium">Performance Improvements</span>
                        <p className="text-white/60 text-sm mt-1">Reduced memory usage and faster startup times</p>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="text-xl font-bold mr-2">Version 1.1.2</span>
                    </div>
                    <p className="text-white/60 text-sm mb-3">Released: March 15, 2025</p>
                    
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <span className="font-medium">Bug fixes</span>
                        <p className="text-white/60 text-sm mt-1">Fixed an issue with autocomplete in TypeScript files</p>
                      </li>
                      <li>
                        <span className="font-medium">Accessibility improvements</span>
                        <p className="text-white/60 text-sm mt-1">Better screen reader support and keyboard navigation</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ),
      },
    ],
  },
];

// Elegant decorative shape component from hero
function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

type SearchResult = {
  categoryId: string;
  sectionId: string;
  categoryTitle: string;
  sectionTitle: string;
};

export function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState<string>(settingsData[0].id);
  const [activeSection, setActiveSection] = useState<string>(settingsData[0].sections[0].id);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    [settingsData[0].id]: true,
  });
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Helper to toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Find current category and section
  const currentCategory = settingsData.find((category) => category.id === activeCategory);
  const currentSection = currentCategory?.sections.find((section) => section.id === activeSection);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    setIsSearching(true);

    // Search through all categories and sections
    const results: SearchResult[] = [];
    settingsData.forEach(category => {
      // Search in category titles
      if (category.title.toLowerCase().includes(query)) {
        category.sections.forEach(section => {
          results.push({
            categoryId: category.id,
            sectionId: section.id,
            categoryTitle: category.title,
            sectionTitle: section.title
          });
        });
      } else {
        // Search in section titles
        category.sections.forEach(section => {
          if (section.title.toLowerCase().includes(query)) {
            results.push({
              categoryId: category.id,
              sectionId: section.id,
              categoryTitle: category.title,
              sectionTitle: section.title
            });
          }
        });
      }
    });

    setSearchResults(results);
  }, [searchQuery]);

  // Handle search result click
  const handleSearchResultClick = (result: SearchResult) => {
    setActiveCategory(result.categoryId);
    setActiveSection(result.sectionId);
    setExpandedCategories(prev => ({
      ...prev,
      [result.categoryId]: true
    }));
    setSearchQuery('');
    setIsSearching(false);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  // Animation variants
  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.4 } 
    },
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.2 + i * 0.1,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-neutral-200 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
      
      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.08]"
          className="left-[-10%] md:left-[-5%] top-[10%] md:top-[15%]"
        />
        <ElegantShape
          delay={0.5}
          width={400}
          height={100}
          rotate={-15}
          gradient="from-rose-500/[0.08]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />
        <ElegantShape
          delay={0.4}
          width={200}
          height={60}
          rotate={-8}
          gradient="from-violet-500/[0.08]"
          className="left-[5%] md:left-[10%] bottom-[20%] md:bottom-[25%]"
        />
      </div>
      
      <div className="flex-1 flex relative z-10 overflow-hidden">
        {/* Left Sidebar - Categories */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ 
            x: isSidebarVisible ? 0 : -280,
            opacity: isSidebarVisible ? 1 : 0,
            width: isSidebarVisible ? '280px' : '0px',
          }}
          transition={{ duration: 0.3 }}
          className="h-full border-r border-white/10 bg-black/20 backdrop-blur-md"
        >
          <div className="p-4 border-b border-white/10 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-indigo-400" />
            <h2 className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">Settings</h2>
          </div>
          
          {/* Search Bar */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-neutral-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search settings..."
                className="w-full py-2 pl-10 pr-8 rounded-md bg-black/30 border border-white/10 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-y-auto h-[calc(100vh-64px-128px-48px)] pb-4">
            {/* Search Results */}
            {isSearching ? (
              <div className="py-2">
                <div className="px-4 py-1 text-xs uppercase text-neutral-500 font-semibold">
                  Search Results ({searchResults.length})
                </div>
                {searchResults.length > 0 ? (
                  <div className="mt-1">
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.categoryId}-${result.sectionId}-${index}`}
                        onClick={() => handleSearchResultClick(result)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors"
                      >
                        <div className="text-indigo-300">{result.sectionTitle}</div>
                        <div className="text-xs text-neutral-500">in {result.categoryTitle}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-2 text-sm text-neutral-400">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            ) : (
              // Regular Category/Section List
              <>
                {settingsData.map((category, idx) => (
                  <motion.div 
                    key={category.id} 
                    className="mb-1"
                    custom={idx}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className={cn(
                        "w-full text-left px-4 py-2 flex items-center justify-between",
                        "hover:bg-white/5 transition-colors",
                        category.id === activeCategory 
                          ? "bg-gradient-to-r from-indigo-500/10 to-rose-500/10 border-l-2 border-indigo-500/50" 
                          : ""
                      )}
                    >
                      <span className="font-medium flex items-center">
                        {category.icon}
                        {category.title}
                      </span>
                      {expandedCategories[category.id] ? (
                        <ChevronDown className="h-4 w-4 text-neutral-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-neutral-400" />
                      )}
                    </button>
                    
                    {expandedCategories[category.id] && (
                      <div className="pl-4 py-1">
                        {category.sections.map((section) => (
                          <button
                            key={section.id}
                            onClick={() => {
                              setActiveCategory(category.id);
                              setActiveSection(section.id);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-2 text-sm rounded-md",
                              "hover:bg-white/5 transition-colors",
                              section.id === activeSection
                                ? "bg-gradient-to-r from-indigo-500/20 to-transparent text-indigo-200"
                                : "text-neutral-400"
                            )}
                          >
                            {section.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </motion.div>

        {/* Main content */}
        <motion.div 
          className="flex-1 overflow-auto h-[calc(100vh-128px)]"
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-md border-b border-white/10">
            {/* Main header row */}
            <div className="p-4 flex items-center">
              <button 
                onClick={() => setSidebarVisible(!isSidebarVisible)}
                className="p-2 rounded-md hover:bg-white/10 mr-2"
              >
                <ArrowLeft className={`h-5 w-5 transition-transform ${!isSidebarVisible ? 'rotate-180' : ''}`} />
              </button>
              <div className="flex-1">
                <div className="text-sm text-neutral-400">{currentCategory?.title}</div>
                <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
                  {currentSection?.title}
                </h1>
              </div>
            </div>
            
            {/* Top Search Bar - Only visible when sidebar is collapsed */}
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: !isSidebarVisible ? 'auto' : 0,
                opacity: !isSidebarVisible ? 1 : 0
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                opacity: { duration: 0.2, delay: !isSidebarVisible ? 0.1 : 0 }
              }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search settings..."
                    className="w-full py-2 pl-10 pr-8 rounded-md bg-black/30 border border-white/10 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Search Results Dropdown for top search */}
              {isSearching && !isSidebarVisible && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 bg-black/80 backdrop-blur-md border-b border-white/10 max-h-[50vh] overflow-y-auto z-20">
                  <div className="p-4">
                    <div className="mb-2 text-xs uppercase text-neutral-500 font-semibold">
                      Search Results ({searchResults.length})
                    </div>
                    <div className="space-y-1">
                      {searchResults.map((result, index) => (
                        <button
                          key={`top-${result.categoryId}-${result.sectionId}-${index}`}
                          onClick={() => handleSearchResultClick(result)}
                          className="w-full text-left p-2 rounded text-sm hover:bg-white/10 transition-colors"
                        >
                          <div className="text-indigo-300">{result.sectionTitle}</div>
                          <div className="text-xs text-neutral-500">in {result.categoryTitle}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
          
          <div className="p-6 md:p-8 max-w-4xl mx-auto">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="prose prose-invert max-w-none prose-headings:bg-clip-text prose-headings:text-transparent prose-headings:bg-gradient-to-r prose-headings:from-indigo-300 prose-headings:via-white/90 prose-headings:to-rose-300 prose-p:text-white/60"
            >
              {currentSection?.content}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom dock */}
      <div className="absolute bottom-8 left-0 right-0 z-50">
        <AppDock />
      </div>
    </div>
  );
}