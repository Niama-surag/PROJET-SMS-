import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Row,
  Col,
  Space,
  Divider,
  Steps,
  message,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
  MessageOutlined,
  SendOutlined,
  ThunderboltOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0);
  const [resetEmail, setResetEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeTimer, setCodeTimer] = useState(0);
  const [form] = Form.useForm();
  const [forgotForm] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock user data with complete registration info
      const userData = {
        id: 1,
        email: values.email,
        firstName: isRegister ? values.firstName : values.email.split('@')[0],
        lastName: isRegister ? values.lastName : '',
        name: isRegister ? `${values.firstName} ${values.lastName}` : values.email.split('@')[0],
        phone: isRegister ? values.phone || '' : '',
        company: 'SMS Pro Solutions',
        role: isRegister ? 'Manager' : 'Admin',
        permissions: ['campaigns', 'contacts', 'analytics', 'mailing-lists']
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', 'mock-jwt-token-' + Date.now());
      
      onLogin(userData);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Functions
  const handleForgotPasswordSubmit = async (values) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (forgotPasswordStep === 0) {
        // Step 1: Send verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(code);
        setResetEmail(values.email);
        setForgotPasswordStep(1);
        setCodeTimer(60);
        
        // Start countdown
        const interval = setInterval(() => {
          setCodeTimer(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        message.success(`Verification code sent to ${values.email}. Code: ${code} (Demo)`);
        
      } else if (forgotPasswordStep === 1) {
        // Step 2: Verify code
        if (values.code === generatedCode) {
          setForgotPasswordStep(2);
          message.success('Code verified successfully!');
        } else {
          message.error('Invalid verification code. Please try again.');
          return;
        }
        
      } else if (forgotPasswordStep === 2) {
        // Step 3: Reset password
        if (values.newPassword === values.confirmPassword) {
          message.success('Password reset successfully! You can now login with your new password.');
          handleBackToLogin();
        } else {
          message.error('Passwords do not match!');
          return;
        }
      }
    } catch (error) {
      message.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (codeTimer > 0) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setCodeTimer(60);
      
      const interval = setInterval(() => {
        setCodeTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      message.success(`New verification code sent! Code: ${code} (Demo)`);
    } catch (error) {
      message.error('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep(0);
    setResetEmail('');
    setVerificationCode('');
    setGeneratedCode('');
    setCodeTimer(0);
    forgotForm.resetFields();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'hidden'
    }}>
      
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '100px',
        height: '100px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: '70%',
        right: '15%',
        width: '150px',
        height: '150px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '20%',
        width: '80px',
        height: '80px',
        background: 'rgba(255, 255, 255, 0.12)',
        borderRadius: '50%',
        animation: 'float 7s ease-in-out infinite',
        zIndex: 0
      }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .login-card {
          animation: fadeInUp 0.8s ease-out;
        }
        .professional-button {
          transition: all 0.3s ease;
          border-radius: 8px !important;
        }
        .professional-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .logo-container {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>

      <Row justify="center" style={{ width: '100%', maxWidth: '1200px', zIndex: 1, position: 'relative' }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          <Card
            className="login-card"
            style={{ 
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              borderRadius: '20px',
              overflow: 'hidden',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div className="logo-container" style={{ 
                fontSize: '60px', 
                marginBottom: '16px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                <MessageOutlined />
              </div>
              <Title level={1} style={{ 
                background: 'linear-gradient(135deg, #667eea, #764ba2)', 
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '8px',
                fontWeight: 'bold',
                fontSize: '2.5rem'
              }}>
                MessageMaster Pro
              </Title>
              <Text style={{ 
                fontSize: '16px', 
                color: '#666',
                display: 'block',
                marginBottom: '8px'
              }}>
                Professional SMS Marketing Platform
              </Text>
              <Space size="small" style={{ color: '#888', fontSize: '14px' }}>
                <SendOutlined />
                <span>Reach More</span>
                <ThunderboltOutlined />
                <span>Engage Better</span>
                <MessageOutlined />
                <span>Convert Faster</span>
              </Space>
            </div>

            {/* Content Area */}
            {!showForgotPassword ? (
              <>
                {/* Login/Register Toggle */}
                <Row justify="center" style={{ marginBottom: '24px' }}>
                  <div style={{ 
                    background: '#f5f5f5', 
                    padding: '4px', 
                    borderRadius: '12px',
                    display: 'inline-flex'
                  }}>
                    <Button 
                      type={!isRegister ? 'primary' : 'text'}
                      onClick={() => setIsRegister(false)}
                      style={{ 
                        border: 'none',
                        borderRadius: '8px',
                        height: '40px',
                        paddingInline: '24px',
                        background: !isRegister ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                        color: !isRegister ? 'white' : '#666'
                      }}
                    >
                      🔓 Sign In
                    </Button>
                    <Button 
                      type={isRegister ? 'primary' : 'text'}
                      onClick={() => setIsRegister(true)}
                      style={{ 
                        border: 'none',
                        borderRadius: '8px',
                        height: '40px',
                        paddingInline: '24px',
                        background: isRegister ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                        color: isRegister ? 'white' : '#666'
                      }}
                    >
                      🚀 Sign Up
                    </Button>
                  </div>
                </Row>

                {/* Demo Alert */}
                <Alert
                  message="✨ Demo Mode Active"
                  description="Use any email/password combination to access the platform"
                  type="info"
                  showIcon
                  style={{ 
                    marginBottom: '24px',
                    borderRadius: '12px',
                    border: '1px solid #e6f7ff',
                    background: 'linear-gradient(135deg, #e6f7ff, #f0f9ff)'
                  }}
                />

                {/* Login/Register Form */}
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  size="large"
                >
                  {isRegister && (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="✋ First Name"
                          name="firstName"
                          rules={[{ required: true, message: 'Please enter first name' }]}
                        >
                          <Input 
                            prefix={<UserOutlined style={{ color: '#667eea' }} />}
                            placeholder="First Name"
                            style={{ 
                              borderRadius: '8px', 
                              height: '44px',
                              border: '2px solid #f0f0f0'
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="👋 Last Name"
                          name="lastName"
                          rules={[{ required: true, message: 'Please enter last name' }]}
                        >
                          <Input 
                            prefix={<UserOutlined style={{ color: '#667eea' }} />}
                            placeholder="Last Name"
                            style={{ 
                              borderRadius: '8px', 
                              height: '44px',
                              border: '2px solid #f0f0f0'
                            }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}

                  <Form.Item
                    label="📧 Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Please enter email' },
                      { type: 'email', message: 'Please enter valid email' }
                    ]}
                  >
                    <Input 
                      prefix={<MailOutlined style={{ color: '#667eea' }} />}
                      placeholder="Enter your email"
                      style={{ 
                        borderRadius: '8px', 
                        height: '44px',
                        border: '2px solid #f0f0f0'
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="🔐 Password"
                    name="password"
                    rules={[{ required: true, message: 'Please enter password' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: '#667eea' }} />}
                      placeholder="Enter your password"
                      iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                      style={{ 
                        borderRadius: '8px', 
                        height: '44px',
                        border: '2px solid #f0f0f0'
                      }}
                    />
                  </Form.Item>

                  {isRegister && (
                    <Form.Item
                      label="📞 Phone"
                      name="phone"
                    >
                      <Input 
                        prefix={<PhoneOutlined style={{ color: '#667eea' }} />}
                        placeholder="Phone Number (Optional)"
                        style={{ 
                          borderRadius: '8px', 
                          height: '44px',
                          border: '2px solid #f0f0f0'
                        }}
                      />
                    </Form.Item>
                  )}

                  {!isRegister && (
                    <Row justify="end" align="middle" style={{ marginBottom: '16px' }}>
                      <Col>
                        <Button 
                          type="link" 
                          style={{ padding: 0, color: '#667eea', fontWeight: '500' }}
                          onClick={() => setShowForgotPassword(true)}
                        >
                          Forgot password?
                        </Button>
                      </Col>
                    </Row>
                  )}

                  <Form.Item style={{ marginTop: '32px', marginBottom: '16px' }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      className="professional-button"
                      style={{ 
                        height: '52px', 
                        fontSize: '16px',
                        fontWeight: 'bold',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                      }}
                    >
                      {loading 
                        ? (isRegister ? '🔄 Creating Account...' : '🔐 Signing In...') 
                        : isRegister 
                        ? '🚀 Create Account' 
                        : '🔓 Sign In'
                      }
                    </Button>
                  </Form.Item>

                  {isRegister && (
                    <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center', display: 'block' }}>
                      By creating an account, you agree to our Terms of Service and Privacy Policy
                    </Text>
                  )}
                </Form>
              </>
            ) : (
              /* Forgot Password Flow */
              <div>
                {/* Back Button */}
                <Button 
                  type="text" 
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackToLogin}
                  style={{ marginBottom: '16px', color: '#667eea' }}
                >
                  Back to Login
                </Button>

                {/* Progress Steps */}
                <Steps
                  current={forgotPasswordStep}
                  size="small"
                  style={{ marginBottom: '32px' }}
                  items={[
                    {
                      title: 'Email',
                      icon: <MailOutlined />,
                    },
                    {
                      title: 'Verify',
                      icon: <KeyOutlined />,
                    },
                    {
                      title: 'Reset',
                      icon: <CheckCircleOutlined />,
                    },
                  ]}
                />

                <Form
                  form={forgotForm}
                  layout="vertical"
                  onFinish={handleForgotPasswordSubmit}
                  size="large"
                >
                  {forgotPasswordStep === 0 && (
                    /* Step 1: Enter Email */
                    <>
                      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <Title level={3} style={{ color: '#667eea' }}>🔐 Forgot Password</Title>
                        <Text type="secondary">
                          Enter your email address and we'll send you a verification code
                        </Text>
                      </div>

                      <Form.Item
                        label="📧 Email Address"
                        name="email"
                        rules={[
                          { required: true, message: 'Please enter your email' },
                          { type: 'email', message: 'Please enter a valid email' }
                        ]}
                      >
                        <Input 
                          prefix={<MailOutlined style={{ color: '#667eea' }} />}
                          placeholder="Enter your email address"
                          style={{ 
                            borderRadius: '8px', 
                            height: '44px',
                            border: '2px solid #f0f0f0'
                          }}
                        />
                      </Form.Item>

                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          block
                          className="professional-button"
                          style={{ 
                            height: '52px', 
                            fontSize: '16px',
                            fontWeight: 'bold',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            border: 'none',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                          }}
                        >
                          {loading ? '📤 Sending Code...' : '📤 Send Verification Code'}
                        </Button>
                      </Form.Item>
                    </>
                  )}

                  {forgotPasswordStep === 1 && (
                    /* Step 2: Enter Verification Code */
                    <>
                      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <Title level={3} style={{ color: '#667eea' }}>🔑 Enter Verification Code</Title>
                        <Text type="secondary">
                          We sent a 6-digit code to <strong>{resetEmail}</strong>
                        </Text>
                      </div>

                      <Form.Item
                        label="🔢 Verification Code"
                        name="code"
                        rules={[
                          { required: true, message: 'Please enter the verification code' },
                          { len: 6, message: 'Code must be 6 digits' }
                        ]}
                      >
                        <Input 
                          prefix={<KeyOutlined style={{ color: '#667eea' }} />}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          style={{ 
                            borderRadius: '8px', 
                            height: '44px',
                            border: '2px solid #f0f0f0',
                            textAlign: 'center',
                            fontSize: '18px',
                            letterSpacing: '4px'
                          }}
                        />
                      </Form.Item>

                      <Row gutter={12} style={{ marginBottom: '24px' }}>
                        <Col span={12}>
                          <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            className="professional-button"
                            style={{ 
                              height: '52px', 
                              fontSize: '16px',
                              fontWeight: 'bold',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #667eea, #764ba2)',
                              border: 'none',
                              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                            }}
                          >
                            {loading ? '✅ Verifying...' : '✅ Verify Code'}
                          </Button>
                        </Col>
                        <Col span={12}>
                          <Button
                            type="default"
                            onClick={handleResendCode}
                            disabled={codeTimer > 0}
                            loading={loading}
                            block
                            className="professional-button"
                            style={{ 
                              height: '52px', 
                              fontSize: '16px',
                              fontWeight: 'bold',
                              borderRadius: '12px'
                            }}
                            icon={<ReloadOutlined />}
                          >
                            {codeTimer > 0 ? `Resend in ${codeTimer}s` : 'Resend Code'}
                          </Button>
                        </Col>
                      </Row>
                    </>
                  )}

                  {forgotPasswordStep === 2 && (
                    /* Step 3: Reset Password */
                    <>
                      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <Title level={3} style={{ color: '#667eea' }}>🔒 Create New Password</Title>
                        <Text type="secondary">
                          Please enter your new password
                        </Text>
                      </div>

                      <Form.Item
                        label="🔐 New Password"
                        name="newPassword"
                        rules={[
                          { required: true, message: 'Please enter your new password' },
                          { min: 6, message: 'Password must be at least 6 characters' }
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined style={{ color: '#667eea' }} />}
                          placeholder="Enter new password"
                          iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                          style={{ 
                            borderRadius: '8px', 
                            height: '44px',
                            border: '2px solid #f0f0f0'
                          }}
                        />
                      </Form.Item>

                      <Form.Item
                        label="🔐 Confirm Password"
                        name="confirmPassword"
                        rules={[
                          { required: true, message: 'Please confirm your password' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error('Passwords do not match!'));
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined style={{ color: '#667eea' }} />}
                          placeholder="Confirm new password"
                          iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                          style={{ 
                            borderRadius: '8px', 
                            height: '44px',
                            border: '2px solid #f0f0f0'
                          }}
                        />
                      </Form.Item>

                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          block
                          className="professional-button"
                          style={{ 
                            height: '52px', 
                            fontSize: '16px',
                            fontWeight: 'bold',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            border: 'none',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                          }}
                        >
                          {loading ? '🔄 Updating Password...' : '🔐 Update Password'}
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form>
              </div>
            )}

            {/* Quick Demo Access - Only show on login mode */}
            {!showForgotPassword && (
              <>
                <Divider style={{ margin: '32px 0 24px 0' }}>
                  <span style={{ 
                    color: '#666', 
                    fontSize: '14px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: 'bold'
                  }}>
                    ⚡ Quick Demo Access
                  </span>
                </Divider>
                <Row gutter={12}>
                  <Col span={12}>
                    <Button 
                      block 
                      className="professional-button"
                      style={{
                        height: '48px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #ff7eb3, #ff758c)',
                        border: 'none',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(255, 126, 179, 0.3)'
                      }}
                      onClick={() => handleSubmit({ email: 'admin@demo.com', password: 'demo' })}
                    >
                      👨‍💼 Admin Demo
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button 
                      block 
                      className="professional-button"
                      style={{
                        height: '48px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #a8edea, #fed6e3)',
                        border: 'none',
                        color: '#333',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(168, 237, 234, 0.3)'
                      }}
                      onClick={() => handleSubmit({ email: 'manager@demo.com', password: 'demo' })}
                    >
                      👩‍💻 Manager Demo
                    </Button>
                  </Col>
                </Row>
              </>
            )}
            
            {/* Footer */}
            <div style={{ 
              textAlign: 'center', 
              marginTop: '32px',
              padding: '16px',
              background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
              borderRadius: '12px',
              border: '1px solid #dee2e6'
            }}>
              <Text style={{ color: '#6c757d', fontSize: '13px' }}>
                🔒 Secure • 🚀 Fast • 💼 Professional
              </Text>
              <br />
              <Text style={{ color: '#adb5bd', fontSize: '12px' }}>
                © 2025 MessageMaster Pro. All rights reserved.
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
