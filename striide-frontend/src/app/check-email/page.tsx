import React from 'react';

const CheckEmailPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Please Verify Your Email</h1>
        <p className="text-gray-700 mb-6">
          We've sent a verification link to your email. Please check your inbox and click the link to verify your email address, and then login in our website.
        </p>
      </div>
    </div>
  );
};

export default CheckEmailPage;
