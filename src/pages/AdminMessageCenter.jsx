import React, { useState } from 'react';
import { MessageSquare, Settings, Zap, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import toast, { Toaster } from 'react-hot-toast';

const AdminMessageCenter = () => {
  const [autoTriggers, setAutoTriggers] = useState({
    welcomeSignup: { enabled: true, service: 'backend' },
    profileReminder: { enabled: true, service: 'backend' },
    deletionWarning: { enabled: true, service: 'backend' },
    tripUpcoming: { enabled: false, service: 'backend' },
    welcomeBack: { enabled: false, service: 'backend' }
  });

  const [integrations, setIntegrations] = useState({
    twilio: { connected: false, apiKey: '', phoneNumber: '' },
    sendgrid: { connected: false, apiKey: '' },
    resend: { connected: false, apiKey: '' }
  });

  const toggleAutoTrigger = (trigger) => {
    setAutoTriggers(prev => ({
      ...prev,
      [trigger]: { ...prev[trigger], enabled: !prev[trigger].enabled }
    }));
    toast.success(`${trigger} ${autoTriggers[trigger].enabled ? 'disabled' : 'enabled'}`);
  };

  const connectIntegration = (service) => {
    // TODO: Implement actual integration
    setIntegrations(prev => ({
      ...prev,
      [service]: { ...prev[service], connected: true }
    }));
    toast.success(`${service} connected successfully`);
  };

  const messageTemplates = {
    welcomeSignup: {
      name: 'Welcome Signup',
      description: 'Sent immediately when user signs up',
      trigger: 'on_signup'
    },
    profileReminder: {
      name: 'Profile Reminder', 
      description: 'Sent 3 days after signup if no profile',
      trigger: 'day_3_no_profile'
    },
    deletionWarning: {
      name: 'Deletion Warning',
      description: 'Sent 14 days after signup if no profile',
      trigger: 'day_14_no_profile'
    },
    tripUpcoming: {
      name: 'Trip Upcoming',
      description: 'Sent 7 days before trip starts',
      trigger: 'trip_7_days_away'
    },
    welcomeBack: {
      name: 'Welcome Back',
      description: 'Sent after 30 days of inactivity',
      trigger: 'inactive_30_days'
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Toaster position="top-right" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Message Center</h1>
        <p className="text-gray-600 mt-2">Manage auto-triggers and messaging integrations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Auto-Trigger Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6" />
              Auto-Trigger Messages
            </CardTitle>
            <CardDescription>
              Configure automatic messages sent based on user behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(messageTemplates).map(([key, template]) => (
              <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.description}</p>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {template.trigger.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={autoTriggers[key]?.enabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleAutoTrigger(key)}
                  >
                    {autoTriggers[key]?.enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Integration Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-6 w-6" />
              Messaging Integrations
            </CardTitle>
            <CardDescription>
              Connect external services for email delivery and analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
                         {Object.entries(integrations).map(([service, config]) => {
               const serviceInfo = {
                 twilio: { name: 'Twilio', description: 'SMS & Email delivery', icon: '📱' },
                 sendgrid: { name: 'SendGrid', description: 'Email delivery service', icon: '📧' },
                 resend: { name: 'Resend', description: 'Developer-friendly email', icon: '🚀' }
               };
               
               const info = serviceInfo[service];
               
               return (
                 <div key={service} className="flex items-center justify-between p-4 border rounded-lg">
                   <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                       config.connected ? 'bg-green-100' : 'bg-gray-100'
                     }`}>
                       {info.icon}
                     </div>
                     <div>
                       <h4 className="font-medium">{info.name}</h4>
                       <p className="text-sm text-gray-600">
                         {config.connected ? 'Connected' : info.description}
                       </p>
                     </div>
                   </div>
                   <Button
                     variant={config.connected ? "outline" : "default"}
                     size="sm"
                     onClick={() => connectIntegration(service)}
                   >
                     {config.connected ? 'Configure' : 'Connect'}
                   </Button>
                 </div>
               );
             })}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manual messaging and system operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <MessageSquare className="h-6 w-6" />
              <span>Send Manual Message</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Zap className="h-6 w-6" />
              <span>Test Auto-Triggers</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Settings className="h-6 w-6" />
              <span>Message Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backend Integration Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Backend Integration</CardTitle>
          <CardDescription>
            Current messaging system status and configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium">Backend Email Service</h4>
                <p className="text-sm text-gray-600">Handles auto-triggers and manual messages</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              <p>• Welcome emails sent on signup</p>
              <p>• Profile reminders at 3 and 14 days</p>
              <p>• Trip notifications 7 days before departure</p>
              <p>• Inactivity re-engagement after 30 days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMessageCenter;
