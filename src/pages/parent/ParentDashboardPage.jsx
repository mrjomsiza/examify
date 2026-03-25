import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AppShell } from '../../components/common/AppShell';
import { SectionHeader } from '../../components/common/SectionHeader';
import { assignStudentToParent, getStudentsForParent } from '../../services/firestoreService';
import { initializeSubscriptionPayment, verifySubscriptionPayment } from '../../services/paymentsService';
import { Users, Link as LinkIcon, AlertCircle, Plus } from 'lucide-react';

export const ParentDashboardPage = () => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  
  const lastVerifiedReferenceRef = useRef(null);

  const loadStudents = async () => {
    if (!profile?.uid) return;
    try {
      const parentStudents = await getStudentsForParent(profile.uid);
      setStudents(parentStudents);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [profile?.uid]);

  useEffect(() => {
    const runVerification = async () => {
      if (!profile?.uid) return;

      const params = new URLSearchParams(location.search);
      const reference = params.get('reference') || params.get('trxref');

      if (!reference) return;
      if (lastVerifiedReferenceRef.current === reference) return;

      try {
        lastVerifiedReferenceRef.current = reference;
        setLoading(true);
        setStatus('Verifying your payment...');

        const verification = await verifySubscriptionPayment(reference);

        if (verification?.status !== 'success') {
          setStatus(`Payment verification returned status: ${verification?.status ?? 'unknown'}`);
          return;
        }

        setStatus('Payment verified successfully!');
        await loadStudents();
        navigate(location.pathname, { replace: true });
      } catch (error) {
        setStatus(error?.message || 'Payment verification failed.');
      } finally {
        setLoading(false);
      }
    };

    runVerification();
  }, [location.pathname, location.search, navigate, profile?.uid]);


  const handleLinkStudent = async (e) => {
    e.preventDefault();
    if (!studentIdInput.trim()) return;
    
    setLoading(true);
    setStatus('');
    try {
      await assignStudentToParent({
        parentId: profile.uid,
        studentIdentifier: studentIdInput.trim(),
      });
      setStatus('Student successfully linked!');
      setStudentIdInput('');
      await loadStudents();
    } catch (err) {
      setStatus(err.message || 'Failed to link student.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayForStudent = async (student) => {
    try {
      setLoading(true);
      const result = await initializeSubscriptionPayment({
        email: profile?.email,
        studentId: student.uid,
        latestMark: student.previousYearMark ?? 0,
        sessionType: student.sessionType ?? 'online',
        paidByParent: true,
        parentId: profile?.uid
      });

      if (!result?.authorizationUrl) {
        throw new Error('No Paystack authorization URL was returned.');
      }
      window.location.href = result.authorizationUrl;
    } catch (error) {
      alert(error?.message || 'Unable to initialize payment right now.');
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="Parent Dashboard"
      subtitle="Manage your children's accounts, track learning progress, and handle subscriptions."
      role="parent"
      user={profile}
      onLogout={logout}
    >
      <SectionHeader 
        eyebrow="Linked Students" 
        title="Your Children" 
        description="Add students using their email or Examify ID. You can manage multiple students from this panel."
      />
      
      <div className="panel p-6 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="label block mb-2">Student Email or ID</label>
          <input 
            type="text" 
            className="input w-full" 
            placeholder="e.g. ayanda@example.com"
            value={studentIdInput}
            onChange={(e) => setStudentIdInput(e.target.value)}
          />
        </div>
        <button 
          className="btn-primary whitespace-nowrap px-6 py-2 flex items-center gap-2 h-[42px]" 
          onClick={handleLinkStudent}
          disabled={loading || !studentIdInput.trim()}
        >
          <LinkIcon className="h-4 w-4" />
          Link Student
        </button>
      </div>
      
      {status && (
        <div className="mb-6 p-4 rounded-xl bg-slate-100 text-brand-700 flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="w-4 h-4" />
          {status}
        </div>
      )}

      {students.length === 0 ? (
        <div className="py-12 bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500">
          <Users className="h-12 w-12 text-slate-300 mb-4" />
          <p className="text-lg font-medium text-slate-900">No students linked yet</p>
          <p className="text-sm">Link your child's account above to view their progress and manage payments.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <div key={student.uid} className="panel p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{student.displayName || student.email}</h3>
                  <p className="text-sm text-slate-500">{student.grade || 'Unknown Grade'} • {student.province || 'Unknown Region'}</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subscription</span>
                  <span className={`font-semibold ${student.paymentCompleted ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {student.paymentCompleted ? 'Active' : 'Pending Payment'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Session Type</span>
                  <span className="font-medium text-slate-900 capitalize">{student.sessionType || 'Online'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Starting Mark</span>
                  <span className="font-medium text-slate-900">{student.previousYearMark || 0}%</span>
                </div>
              </div>

              {!student.paymentCompleted ? (
                <button 
                  className="btn-primary w-full" 
                  onClick={() => handlePayForStudent(student)}
                  disabled={loading}
                >
                  Pay Subscription
                </button>
              ) : (
                <button className="btn-secondary w-full" disabled>
                  Subscription Active
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
};
