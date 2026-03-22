'use client';
import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import UserSidebar from '@/components/UserSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { attemptsApi, type AttemptDto } from '@/lib/api/attempts';
import { simulationsApi, type SimulationDto } from '@/lib/api/simulations';
import { getMyStats, getUsers, type User, type UserStats, updateMe } from '@/lib/api/users';

const PAGE_SIZE = 100;

async function getAllUsers(): Promise<User[]> {
  let page = 1;
  let totalPages = 1;
  const users: User[] = [];

  while (page <= totalPages) {
    const response = await getUsers(page, PAGE_SIZE);
    users.push(...response.data);
    totalPages = response.totalPages;
    page += 1;
  }

  return users;
}

async function getAllSimulations(): Promise<SimulationDto[]> {
  let page = 1;
  let totalPages = 1;
  const simulations: SimulationDto[] = [];

  while (page <= totalPages) {
    const response = await simulationsApi.getAll(page, PAGE_SIZE);
    simulations.push(...response.data);
    totalPages = response.totalPages;
    page += 1;
  }

  return simulations;
}

function initials(name?: string) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function shortId(value?: string) {
  if (!value) return 'N/A';
  if (value.length <= 10) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function getStatusLabel(success: boolean | null) {
  if (success === true) return 'COMPLETED';
  if (success === false) return 'FAILED';
  return 'ACTIVE';
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

type ProfileFormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [attempts, setAttempts] = useState<AttemptDto[]>([]);
  const [platformUsers, setPlatformUsers] = useState<User[]>([]);
  const [platformSimulations, setPlatformSimulations] = useState<SimulationDto[]>([]);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<ProfileFormErrors>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState('');

  useEffect(() => {
    setProfileForm((prev) => ({
      ...prev,
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
      confirmPassword: '',
    }));
  }, [user?.name, user?.email]);

  useEffect(() => {
    let isMounted = true;

    async function loadProfileData() {
      if (!user) return;

      setIsLoading(true);
      setErrorMessage('');

      try {
        const baseRequests = [getMyStats(), attemptsApi.getMyAttempts()] as const;

        if (isAdmin) {
          const [statsResponse, attemptsResponse, usersResponse, simulationsResponse] = await Promise.all([
            baseRequests[0],
            baseRequests[1],
            getAllUsers(),
            getAllSimulations(),
          ]);

          if (!isMounted) return;

          setStats(statsResponse);
          setAttempts(attemptsResponse);
          setPlatformUsers(usersResponse);
          setPlatformSimulations(simulationsResponse);
        } else {
          const [statsResponse, attemptsResponse] = await Promise.all(baseRequests);

          if (!isMounted) return;

          setStats(statsResponse);
          setAttempts(attemptsResponse);
          setPlatformUsers([]);
          setPlatformSimulations([]);
        }
      } catch {
        if (!isMounted) return;
        setErrorMessage('Unable to load profile statistics right now.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProfileData();

    return () => {
      isMounted = false;
    };
  }, [isAdmin, user]);

  const attemptMetrics = useMemo(() => {
    const success = attempts.filter((attempt) => attempt.success === true).length;
    const failed = attempts.filter((attempt) => attempt.success === false).length;
    const active = attempts.filter((attempt) => attempt.success === null).length;
    const completed = success + failed;
    const successRate = completed === 0 ? 0 : Math.round((success / completed) * 100);
    const totalHints = attempts.reduce((sum, attempt) => sum + (attempt.hints_used ?? 0), 0);

    return { success, failed, active, successRate, totalHints };
  }, [attempts]);

  const platformMetrics = useMemo(() => {
    const totalUsers = platformUsers.length;
    const admins = platformUsers.filter((item) => item.role === 'ADMIN').length;
    const participants = platformUsers.filter((item) => item.role === 'PARTICIPANT').length;
    const totalLabs = platformSimulations.length;
    const activeLabs = platformSimulations.filter((item) => item.status === 'Active').length;

    return {
      totalUsers,
      admins,
      participants,
      totalLabs,
      activeLabs,
    };
  }, [platformUsers, platformSimulations]);

  const recentAttempts = useMemo(() => {
    return [...attempts]
      .sort((a, b) => {
        const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
        const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 6);
  }, [attempts]);

  const handleProfileFieldChange = (
    field: 'name' | 'email' | 'password' | 'confirmPassword',
    value: string,
  ) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
    setProfileSuccessMessage('');
  };

  const validateProfileForm = (): ProfileFormErrors => {
    const errors: ProfileFormErrors = {};
    const trimmedName = profileForm.name.trim();
    const trimmedEmail = profileForm.email.trim();

    if (!trimmedName) {
      errors.name = 'Name is required.';
    } else if (trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }

    if (!trimmedEmail) {
      errors.email = 'Email is required.';
    } else if (!isValidEmail(trimmedEmail)) {
      errors.email = 'Enter a valid email address.';
    }

    if (profileForm.password && profileForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (profileForm.password !== profileForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    return errors;
  };

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileSuccessMessage('');

    const validationErrors = validateProfileForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    const payload: { name?: string; email?: string; password?: string } = {};
    const trimmedName = profileForm.name.trim();
    const trimmedEmail = profileForm.email.trim();

    if (trimmedName !== (user?.name ?? '')) {
      payload.name = trimmedName;
    }

    if (trimmedEmail !== (user?.email ?? '')) {
      payload.email = trimmedEmail;
    }

    if (profileForm.password) {
      payload.password = profileForm.password;
    }

    if (Object.keys(payload).length === 0) {
      setFormErrors({ form: 'No profile changes to save.' });
      return;
    }

    setIsSavingProfile(true);
    setFormErrors({});

    try {
      const updatedUser = await updateMe(payload);
      await refreshUser();

      setStats((prev) =>
        prev
          ? {
            ...prev,
            name: updatedUser.name ?? prev.name,
            email: updatedUser.email ?? prev.email,
          }
          : prev,
      );

      setProfileForm((prev) => ({
        ...prev,
        name: updatedUser.name ?? prev.name,
        email: updatedUser.email ?? prev.email,
        password: '',
        confirmPassword: '',
      }));

      setProfileSuccessMessage('Profile updated successfully.');
    } catch (error: unknown) {
      let message = 'Failed to update profile.';

      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: unknown }).response === 'object' &&
        (error as { response?: unknown }).response !== null
      ) {
        const responseData = (error as { response: { data?: unknown } }).response.data;

        if (typeof responseData === 'string') {
          message = responseData;
        } else if (
          typeof responseData === 'object' &&
          responseData !== null &&
          'message' in responseData
        ) {
          const maybeMessage = (responseData as { message?: unknown }).message;
          if (typeof maybeMessage === 'string') {
            message = maybeMessage;
          } else if (Array.isArray(maybeMessage)) {
            message = maybeMessage.join(', ');
          }
        }
      }

      setFormErrors({ form: message });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleProfileReset = () => {
    setProfileForm({
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
      confirmPassword: '',
    });
    setFormErrors({});
    setProfileSuccessMessage('');
  };

  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen flex">
      {isAdmin ? <AdminSidebar /> : <UserSidebar />}

      <main className="flex-1 relative overflow-y-auto bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="scanline"></div>

        <header className="p-8 border-b border-slate-800 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className={`text-2xl font-bold ${isAdmin ? 'text-red-400' : 'text-white'}`}>
              {isAdmin ? 'ADMIN_PROFILE.exe' : 'OPERATOR_PROFILE.exe'}
            </h2>
            <p className="text-sm text-slate-500 italic">
              {isAdmin
                ? 'Account details and platform-level administration metrics...'
                : 'Personal progress, statistics, and recent activity...'}
            </p>
          </div>
        </header>

        <div className="p-8 max-w-6xl">
          {errorMessage ? (
            <section className="mb-8 rounded border border-red-800 bg-red-950/20 p-4 text-sm text-red-300">
              {errorMessage}
            </section>
          ) : null}

          <section className="bg-slate-900 border border-slate-700 rounded-lg p-8 mb-8">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-cyan-900/30 border-2 border-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-4xl font-bold text-cyan-400">{initials(user?.name)}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">{user?.name ?? 'Unknown User'}</h3>
                <div className="flex gap-4 text-sm mb-4">
                  <span className="text-slate-400">{user?.email ?? 'N/A'}</span>
                  <span className="text-cyan-400">• Role: {user?.role ?? 'N/A'}</span>
                </div>
                {!isAdmin ?
                  (<div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="bg-slate-950 border border-cyan-900 px-4 py-2 rounded">
                      <div className="text-xs text-slate-500 uppercase">Total XP</div>
                      <div className="text-xl font-bold text-cyan-400">{isLoading ? '...' : stats?.exp ?? 0}</div>
                    </div>
                    <div className="bg-slate-950 border border-cyan-900 px-4 py-2 rounded">
                      <div className="text-xs text-slate-500 uppercase">Total Score</div>
                      <div className="text-xl font-bold text-emerald-400">
                        {isLoading ? '...' : stats?.total_score ?? 0}
                      </div>
                    </div>
                    <div className="bg-slate-950 border border-cyan-900 px-4 py-2 rounded">
                      <div className="text-xs text-slate-500 uppercase">Completed Labs</div>
                      <div className="text-xl font-bold text-amber-400">
                        {isLoading ? '...' : stats?.completed_labs ?? 0}
                      </div>
                    </div>
                    <div className="bg-slate-950 border border-cyan-900 px-4 py-2 rounded">
                      <div className="text-xs text-slate-500 uppercase">Badge</div>
                      <div className="text-xl font-bold text-violet-300">
                        {isLoading ? '...' : stats?.badge ?? 'N/A'}
                      </div>
                    </div>
                  </div>) : ''
                }
              </div>
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-700 rounded-lg p-8 mb-8">
            <h3 className="text-white font-bold uppercase text-sm mb-4 flex items-center gap-2">
              <span className={`w-1 h-4 ${isAdmin ? 'bg-red-400' : 'bg-cyan-400'}`}></span>
              Profile Settings
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-2xl">
              <div>
                <label htmlFor="profile-name" className="block text-xs text-slate-400 mb-2 uppercase">
                  Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={profileForm.name}
                  onChange={(event) => handleProfileFieldChange('name', event.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm"
                />
                {formErrors.name ? <p className="text-xs text-red-400 mt-1">{formErrors.name}</p> : null}
              </div>

              <div>
                <label htmlFor="profile-email" className="block text-xs text-slate-400 mb-2 uppercase">
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={profileForm.email}
                  onChange={(event) => handleProfileFieldChange('email', event.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm"
                />
                {formErrors.email ? <p className="text-xs text-red-400 mt-1">{formErrors.email}</p> : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-password" className="block text-xs text-slate-400 mb-2 uppercase">
                    New Password
                  </label>
                  <input
                    id="profile-password"
                    type="password"
                    value={profileForm.password}
                    onChange={(event) => handleProfileFieldChange('password', event.target.value)}
                    placeholder="Leave blank to keep current password"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm"
                  />
                  {formErrors.password ? <p className="text-xs text-red-400 mt-1">{formErrors.password}</p> : null}
                </div>

                <div>
                  <label htmlFor="profile-confirm-password" className="block text-xs text-slate-400 mb-2 uppercase">
                    Confirm New Password
                  </label>
                  <input
                    id="profile-confirm-password"
                    type="password"
                    value={profileForm.confirmPassword}
                    onChange={(event) =>
                      handleProfileFieldChange('confirmPassword', event.target.value)
                    }
                    placeholder="Repeat new password"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm"
                  />
                  {formErrors.confirmPassword ? (
                    <p className="text-xs text-red-400 mt-1">{formErrors.confirmPassword}</p>
                  ) : null}
                </div>
              </div>

              {formErrors.form ? (
                <p className="text-sm text-red-400 border border-red-900/50 bg-red-950/20 rounded px-3 py-2">
                  {formErrors.form}
                </p>
              ) : null}

              {profileSuccessMessage ? (
                <p className="text-sm text-emerald-300 border border-emerald-900/50 bg-emerald-950/20 rounded px-3 py-2">
                  {profileSuccessMessage}
                </p>
              ) : null}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-2 rounded text-sm font-semibold uppercase tracking-wide bg-cyan-900/40 border border-cyan-700 text-cyan-200 hover:bg-cyan-900/60 disabled:opacity-60"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </button>

                <button
                  type="button"
                  onClick={handleProfileReset}
                  disabled={isSavingProfile}
                  className="px-4 py-2 rounded text-sm font-semibold uppercase tracking-wide bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-60"
                >
                  Reset
                </button>
              </div>
            </form>
          </section>

          {isAdmin ? (
            <section className="mb-8">
              <h3 className="text-white font-bold uppercase text-sm mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-red-400"></span>
                Platform Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase">Total Users</div>
                  <div className="text-2xl font-bold text-red-300 mt-1">
                    {isLoading ? '...' : platformMetrics.totalUsers}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase">Admins</div>
                  <div className="text-2xl font-bold text-red-400 mt-1">
                    {isLoading ? '...' : platformMetrics.admins}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase">Participants</div>
                  <div className="text-2xl font-bold text-cyan-400 mt-1">
                    {isLoading ? '...' : platformMetrics.participants}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase">Total Labs</div>
                  <div className="text-2xl font-bold text-amber-300 mt-1">
                    {isLoading ? '...' : platformMetrics.totalLabs}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase">Active Labs</div>
                  <div className="text-2xl font-bold text-emerald-300 mt-1">
                    {isLoading ? '...' : platformMetrics.activeLabs}
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="mb-8">
              <h3 className="text-white font-bold uppercase text-sm mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-cyan-400"></span>
                Performance Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase">Success Rate</div>
                  <div className="text-2xl font-bold text-emerald-300 mt-1">
                    {isLoading ? '...' : `${attemptMetrics.successRate}%`}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase">Successful Attempts</div>
                  <div className="text-2xl font-bold text-cyan-400 mt-1">
                    {isLoading ? '...' : attemptMetrics.success}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase">Failed Attempts</div>
                  <div className="text-2xl font-bold text-red-400 mt-1">
                    {isLoading ? '...' : attemptMetrics.failed}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase">Hints Used</div>
                  <div className="text-2xl font-bold text-amber-300 mt-1">
                    {isLoading ? '...' : attemptMetrics.totalHints}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section>
            <h3 className="text-white font-bold uppercase text-sm mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-cyan-400"></span>
              Recent Attempts
            </h3>
            {recentAttempts.length === 0 && !isLoading ? (
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm text-slate-500">
                No attempts found yet.
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-700 rounded-lg divide-y divide-slate-800">
                {recentAttempts.map((attempt) => (
                  <div
                    key={attempt._id}
                    className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 hover:bg-slate-800/50 transition"
                  >
                    <div>
                      <div className="text-cyan-400 text-sm font-bold mb-1">
                        Simulation #{shortId(attempt.simulation_id)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {getStatusLabel(attempt.success)} • submissions: {attempt.attempts.length} • hints used:{' '}
                        {attempt.hints_used}
                      </div>
                    </div>
                    <div className="text-xs text-slate-600">
                      Score: {attempt.final_score ?? 0} • {new Date(attempt.updatedAt ?? attempt.createdAt ?? Date.now()).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <style jsx>{`
        .scanline {
          width: 100%;
          height: 2px;
          background: rgba(34, 211, 238, 0.1);
          position: absolute;
          animation: scan 4s linear infinite;
        }
        @keyframes scan {
          from {
            top: 0;
          }
          to {
            top: 100%;
          }
        }
      `}</style>
    </div>
  );
}
