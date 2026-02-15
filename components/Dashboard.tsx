'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ProfileData {
  gpa: number;
  sat: number;
  act: number;
  apOffered: number;
  apTaken: number;
  ecTier: number;
  roles: number;
  majorMultiplier: number;
  isED: boolean;
  isAthlete: boolean;
  isLegacy: boolean;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<ProfileData>({
    gpa: 3.95,
    sat: 1510,
    act: 0,
    apOffered: 18,
    apTaken: 12,
    ecTier: 7,
    roles: 3,
    majorMultiplier: 1.0,
    isED: false,
    isAthlete: false,
    isLegacy: false,
  });

  const [metrics, setMetrics] = useState({
    testPercentile: 0,
    gpaPercentile: 0,
    aiScore: 0,
    rigorScore: 0,
    ecScore: 0,
    finalScore: 0,
    verdict: '',
    testLabel: 'Test Percentile',
    testSub: 'No Score',
    feedback: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  // Calculate metrics whenever profile changes
  useEffect(() => {
    calculateMetrics();
  }, [profile]);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      
      if (data.profile) {
        setProfile({
          gpa: parseFloat(data.profile.gpa) || 3.95,
          sat: data.profile.sat || 1510,
          act: data.profile.act || 0,
          apOffered: data.profile.ap_offered || 18,
          apTaken: data.profile.ap_taken || 12,
          ecTier: data.profile.ec_tier || 7,
          roles: data.profile.roles || 3,
          majorMultiplier: parseFloat(data.profile.major_multiplier) || 1.0,
          isED: data.profile.is_ed || false,
          isAthlete: data.profile.is_athlete || false,
          isLegacy: data.profile.is_legacy || false,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gpa: profile.gpa,
          sat: profile.sat,
          act: profile.act,
          ap_offered: profile.apOffered,
          ap_taken: profile.apTaken,
          ec_tier: profile.ecTier,
          roles: profile.roles,
          major_multiplier: profile.majorMultiplier,
          is_ed: profile.isED,
          is_athlete: profile.isAthlete,
          is_legacy: profile.isLegacy,
        }),
      });

      if (response.ok) {
        console.log('Profile saved successfully');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const calculateMetrics = () => {
    const { gpa, sat, act, apOffered, apTaken, ecTier, roles, majorMultiplier, isED, isAthlete, isLegacy } = profile;

    // Determine test score
    let testPercentile = 0;
    let aiTestScore = 0;
    let testLabel = 'Test Percentile';
    let testSub = 'No Score';

    if (sat > 0) {
      if (sat >= 1520) testPercentile = 99;
      else if (sat >= 1450) testPercentile = 96;
      else if (sat >= 1350) testPercentile = 90;
      else if (sat >= 1200) testPercentile = 75;
      else if (sat >= 1050) testPercentile = 50;
      else testPercentile = Math.max(1, Math.round((sat / 1600) * 50));

      aiTestScore = (sat / 1600) * 80;
      testLabel = 'SAT Percentile';
      testSub = 'SAT Rank';
    } else if (act > 0) {
      if (act >= 34) testPercentile = 99;
      else if (act >= 30) testPercentile = 95;
      else if (act >= 26) testPercentile = 82;
      else if (act >= 21) testPercentile = 50;
      else testPercentile = Math.max(1, Math.round((act / 36) * 50));

      aiTestScore = (act / 36) * 80;
      testLabel = 'ACT Percentile';
      testSub = 'ACT Rank';
    }

    // GPA Percentile
    let gpaPercentile = 0;
    if (gpa >= 4.0) gpaPercentile = 99;
    else if (gpa >= 3.8) gpaPercentile = 90;
    else if (gpa >= 3.5) gpaPercentile = 75;
    else if (gpa >= 3.0) gpaPercentile = 50;
    else gpaPercentile = Math.max(1, Math.round((gpa / 4.0) * 50));

    // Academic Index
    const rankScore = gpa >= 3.9 ? 78 : 75;
    const aiRaw = ((gpa / 4.0) * 80) + aiTestScore + rankScore;
    const aiScore = Math.min(Math.round(aiRaw), 240);

    // Rigor
    let rigorRatio = apOffered > 0 ? (apTaken / apOffered) : 0;
    if (apOffered < 8 && rigorRatio >= 0.8) rigorRatio = 1.0;
    const rigorScore = Math.min((rigorRatio * 10) + (apTaken > 10 ? 1 : 0), 10);

    // EC
    const ecScore = Math.min(ecTier + (roles * 0.5), 10);

    // Overall Score
    const aiNorm = (aiScore / 240) * 100;
    const rigorNorm = (rigorScore / 10) * 100;
    const ecNorm = (ecScore / 10) * 100;
    const baseScore = (aiNorm * 0.4) + (rigorNorm * 0.3) + (ecNorm * 0.3);

    let finalScore = baseScore * majorMultiplier;
    if (isED) finalScore += 8;
    if (isAthlete) finalScore += 20;
    if (isLegacy) finalScore += 5;
    finalScore = Math.min(Math.round(finalScore), 99);

    // Verdict
    let verdict = '';
    if (finalScore >= 90) verdict = 'Elite Tier';
    else if (finalScore >= 80) verdict = 'Strong Match';
    else if (finalScore >= 70) verdict = 'Competitive';
    else verdict = 'Reach';

    // Feedback
    let feedback = '';
    if (isAthlete) feedback = '<b>Recruit Status:</b> As a recruited athlete, your admissions bar is significantly different from the general pool. ';
    else if (majorMultiplier < 1.0) feedback = '<b>Major Warning:</b> Your intended major is highly competitive, lowering your odds despite good stats. ';
    if (aiScore < 220 && finalScore > 85 && !isAthlete) feedback += '<b>Activity Spike:</b> Your extracurriculars are carrying the application. ';
    if (feedback === '') feedback = '<b>Balanced Profile:</b> Your metrics are well-distributed. Focus on the narrative in your essays.';

    setMetrics({
      testPercentile,
      gpaPercentile,
      aiScore,
      rigorScore: parseFloat(rigorScore.toFixed(1)),
      ecScore: parseFloat(ecScore.toFixed(1)),
      finalScore,
      verdict,
      testLabel,
      testSub,
      feedback,
    });
  };

  const handleProfileChange = (field: keyof ProfileData, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelectorAll('.scroll-section').forEach((el) => {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const header = document.getElementById('profile-integrity');
    if (header) {
      header.classList.remove('pulse-highlight');
      void header.offsetWidth;
      header.classList.add('pulse-highlight');
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="flex h-full w-full">
        {/* LEFT SIDEBAR */}
        <aside className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FFE500] text-black font-black flex items-center justify-center shadow-sm">
            DS
          </div>

          <nav className="flex flex-col gap-6 text-slate-400">
            <a href="https://google.com" target="_blank" rel="noopener noreferrer" title="Menu"
               className="w-12 h-12 rounded-2xl hover:bg-slate-50 flex items-center justify-center transition">
              <i className="fas fa-bars text-lg"></i>
            </a>

            <a href="#profile-integrity" onClick={scrollToTop} title="Profile Integrity"
               className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center transition">
              <i className="fas fa-user text-lg"></i>
            </a>

            <a href="https://google.com" target="_blank" rel="noopener noreferrer" title="Academics"
               className="w-12 h-12 rounded-2xl hover:bg-slate-50 flex items-center justify-center transition">
              <i className="fas fa-graduation-cap text-lg"></i>
            </a>

            <a href="https://google.com" target="_blank" rel="noopener noreferrer" title="Explore Colleges"
               className="w-12 h-12 rounded-2xl hover:bg-slate-50 flex items-center justify-center transition">
              <i className="fas fa-compass text-lg"></i>
            </a>

            <a href="https://google.com" target="_blank" rel="noopener noreferrer" title="Community"
               className="w-12 h-12 rounded-2xl hover:bg-slate-50 flex items-center justify-center transition">
              <i className="fas fa-users text-lg"></i>
            </a>

            <a href="https://google.com" target="_blank" rel="noopener noreferrer" title="Essays & Writing"
               className="w-12 h-12 rounded-2xl hover:bg-slate-50 flex items-center justify-center transition">
              <i className="fas fa-pen-to-square text-lg"></i>
            </a>
          </nav>

          <div className="mt-auto pb-2">
            <Image
              src="https://i.pravatar.cc/44"
              alt="User"
              width={44}
              height={44}
              className="w-11 h-11 rounded-full ring-2 ring-slate-200 cursor-pointer"
            />
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* TOP HEADER */}
          <header id="profile-integrity"
                  className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
            <div className="min-w-0">
              <div className="text-xs font-bold tracking-[0.25em] text-blue-600 uppercase">
                Principle of Profile Design
              </div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 truncate">
                  Profile Integrity
                </h1>
                <span className="text-3xl lg:text-4xl font-black text-blue-600">.</span>
              </div>
              <p className="text-sm text-slate-500 hidden md:block">
                Accuracy drives higher confidence. Complete your academic vitals to unlock deeper matching intelligence.
              </p>
            </div>

            <div className="flex items-center gap-3 lg:gap-4">
              <div className="px-4 py-2 rounded-full bg-slate-100 text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> SYNCED
              </div>
              <button className="w-10 h-10 rounded-full border border-slate-300 hover:bg-slate-50 flex items-center justify-center text-slate-400 transition">
                <i className="fas fa-question"></i>
              </button>
            </div>
          </header>

          {/* CONTENT AREA */}
          <main className="flex-1 overflow-hidden p-2 lg:p-3">
            <div className="text-slate-800 h-full overflow-hidden p-2 lg:p-4 flex justify-center">
              <div className="max-w-[1400px] w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* LEFT PANEL */}
                <div className="lg:col-span-4 h-full overflow-y-auto scroll-section pr-2 flex flex-col gap-4">
                  {/* Controls Card */}
                  <div className="birch-card bg-white p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white">
                          <i className="fas fa-sliders-h"></i>
                        </div>
                        <div>
                          <div className="text-xs font-bold tracking-wider text-slate-500 uppercase">Controls</div>
                          <div className="text-xl font-black text-slate-900">Academic Inputs</div>
                        </div>
                      </div>

                      {/* GPA */}
                      <div className="mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-bold text-slate-700">Unweighted GPA</span>
                          <span className="text-sm font-bold text-blue-600">{profile.gpa.toFixed(2)}</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="4.0"
                          value={profile.gpa}
                          onChange={(e) => handleProfileChange('gpa', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* SAT */}
                      <div className="mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-bold text-slate-700">SAT Score</span>
                          <span className="text-sm font-bold text-blue-600">{profile.sat || 'Not Set'}</span>
                        </div>
                        <input
                          type="number"
                          min="400"
                          max="1600"
                          step="10"
                          value={profile.sat || ''}
                          onChange={(e) => handleProfileChange('sat', parseInt(e.target.value) || 0)}
                          placeholder="Leave 0 if taking ACT"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* ACT */}
                      <div className="mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-bold text-slate-700">ACT Score</span>
                          <span className="text-sm font-bold text-blue-600">{profile.act || 'Not Set'}</span>
                        </div>
                        <input
                          type="number"
                          min="1"
                          max="36"
                          value={profile.act || ''}
                          onChange={(e) => handleProfileChange('act', parseInt(e.target.value) || 0)}
                          placeholder="Leave 0 if taking SAT"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* AP Courses */}
                      <div className="mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-bold text-slate-700">AP Courses Offered</span>
                          <span className="text-sm font-bold text-blue-600">{profile.apOffered}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          value={profile.apOffered}
                          onChange={(e) => handleProfileChange('apOffered', parseInt(e.target.value))}
                        />
                      </div>

                      <div className="mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-bold text-slate-700">AP Courses Taken</span>
                          <span className="text-sm font-bold text-blue-600">{profile.apTaken}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          value={profile.apTaken}
                          onChange={(e) => handleProfileChange('apTaken', parseInt(e.target.value))}
                        />
                      </div>

                      {/* EC Tier */}
                      <div className="mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-bold text-slate-700">EC Tier (1-10)</span>
                          <span className="text-sm font-bold text-blue-600">{profile.ecTier}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={profile.ecTier}
                          onChange={(e) => handleProfileChange('ecTier', parseInt(e.target.value))}
                        />
                      </div>

                      {/* Leadership Roles */}
                      <div className="mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-bold text-slate-700">Leadership Roles</span>
                          <span className="text-sm font-bold text-blue-600">{profile.roles} Roles</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="8"
                          value={profile.roles}
                          onChange={(e) => handleProfileChange('roles', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Strategy Card */}
                  <div className="birch-card bg-white p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-[#FFE500] rounded-full flex items-center justify-center text-black">
                        <i className="fas fa-chess-knight"></i>
                      </div>
                      <div>
                        <div className="text-xs font-bold tracking-wider text-slate-500 uppercase">Strategy</div>
                        <div className="text-xl font-black text-slate-900">Admissions Hooks</div>
                      </div>
                    </div>

                    {/* Major Competitiveness */}
                    <div className="mb-6">
                      <label className="text-sm font-bold text-slate-700 mb-2 block">Intended Major</label>
                      <select
                        value={profile.majorMultiplier}
                        onChange={(e) => handleProfileChange('majorMultiplier', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="0.85">CS / Engineering (Hardest)</option>
                        <option value="0.95">Business / Econ</option>
                        <option value="1.0">Liberal Arts / Undecided</option>
                        <option value="1.05">Humanities</option>
                      </select>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.isED}
                          onChange={(e) => handleProfileChange('isED', e.target.checked)}
                          className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-bold text-slate-700">Early Decision (ED)</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.isAthlete}
                          onChange={(e) => handleProfileChange('isAthlete', e.target.checked)}
                          className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-bold text-slate-700">Recruited Athlete</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.isLegacy}
                          onChange={(e) => handleProfileChange('isLegacy', e.target.checked)}
                          className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-bold text-slate-700">Legacy Status</span>
                      </label>
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={saveProfile}
                      disabled={isSaving}
                      className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="lg:col-span-8 h-full overflow-y-auto scroll-section pr-2 flex flex-col gap-4">
                  {/* Score Overview */}
                  <div className="birch-card bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-1">
                          Admissions Confidence Score
                        </div>
                        <div className="text-7xl font-black">{metrics.finalScore}</div>
                      </div>
                      <div className="text-right">
                        <div className="px-4 py-2 rounded-full bg-slate-700 text-xs font-bold flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-[#FFE500] animate-pulse"></div>
                          <span>{metrics.verdict}</span>
                        </div>
                        {(profile.isED || profile.isAthlete) && (
                          <div className="flex gap-2 justify-end mt-2">
                            {profile.isED && (
                              <div className="flex items-center gap-2 p-2 bg-slate-700 rounded-lg">
                                <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                                  <i className="fas fa-bolt text-xs"></i>
                                </div>
                                <div className="text-xs font-bold leading-tight">ED<br/>Active</div>
                              </div>
                            )}
                            {profile.isAthlete && (
                              <div className="flex items-center gap-2 p-2 bg-slate-700 rounded-lg">
                                <div className="w-6 h-6 bg-[#FFE500] rounded flex items-center justify-center text-black">
                                  <i className="fas fa-crown text-xs"></i>
                                </div>
                                <div className="text-xs font-bold leading-tight">Recruit<br/>Status</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metrics Bars */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span>Academic Index</span>
                          <span>{metrics.aiScore} / 240</span>
                        </div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 progress-bar"
                            style={{ width: `${(metrics.aiScore / 240) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span>Course Rigor</span>
                          <span>{metrics.rigorScore} / 10</span>
                        </div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 progress-bar"
                            style={{ width: `${(metrics.rigorScore / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span>Extracurriculars</span>
                          <span>{metrics.ecScore} / 10</span>
                        </div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#FFE500] progress-bar"
                            style={{ width: `${(metrics.ecScore / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gauges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Test Score Gauge */}
                    <div className="birch-card bg-white p-6">
                      <div className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-1">
                        {metrics.testLabel}
                      </div>
                      <div className="text-xs text-slate-400 mb-4">{metrics.testSub}</div>
                      <div className="flex items-center justify-center">
                        <svg className="w-32 h-32 -rotate-90">
                          <circle cx="64" cy="64" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                          <circle
                            cx="64"
                            cy="64"
                            r="45"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="8"
                            strokeDasharray="283"
                            strokeDashoffset={283 - (283 * (metrics.testPercentile / 100))}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <div className="text-3xl font-black text-slate-900">{metrics.testPercentile}</div>
                          <div className="text-xs text-slate-500">%ile</div>
                        </div>
                      </div>
                    </div>

                    {/* GPA Gauge */}
                    <div className="birch-card bg-white p-6">
                      <div className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-1">
                        GPA Percentile
                      </div>
                      <div className="text-xs text-slate-400 mb-4">Unweighted</div>
                      <div className="flex items-center justify-center">
                        <svg className="w-32 h-32 -rotate-90">
                          <circle cx="64" cy="64" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                          <circle
                            cx="64"
                            cy="64"
                            r="45"
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="8"
                            strokeDasharray="283"
                            strokeDashoffset={283 - (283 * (metrics.gpaPercentile / 100))}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <div className="text-3xl font-black text-slate-900">{metrics.gpaPercentile}</div>
                          <div className="text-xs text-slate-500">%ile</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="birch-card bg-blue-50 p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        <i className="fas fa-lightbulb"></i>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-blue-900 mb-2">Strategic Insight</div>
                        <div 
                          className="text-sm text-blue-800"
                          dangerouslySetInnerHTML={{ __html: metrics.feedback }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
