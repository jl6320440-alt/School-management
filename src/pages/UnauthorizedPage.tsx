import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { AlertTriangle } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            This page is restricted to specific roles. Please contact your administrator if you believe you should have access.
          </p>
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate('/login')} className="w-full">
            Sign Out & Login Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
