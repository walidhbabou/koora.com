import React from 'react';
import NewsContentTest from '@/components/NewsContentTest';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <NewsContentTest />
      </div>
      <Footer />
    </div>
  );
};

export default TestPage;