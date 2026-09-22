import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import FormInput from '../components/ui/FormInput';
import AlertBanner from '../components/feedback/AlertBanner';
import Card, { CardBody } from '../components/ui/Card';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { register, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await register({ name: formData.name, email: formData.email, password: formData.password });
      toast.success('Account created successfully!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-display font-bold tracking-tight text-white">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-textSecondary">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent hover:text-accentHover">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardBody>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && <AlertBanner type="error" message={error} />}
              
              <FormInput label="Full name" id="name" type="text" required value={formData.name} onChange={handleChange} />
              <FormInput label="Email address" id="email" type="email" required value={formData.email} onChange={handleChange} />
              <FormInput label="Password" id="password" type="password" required value={formData.password} onChange={handleChange} />
              <FormInput label="Confirm Password" id="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} />

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Sign up
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
