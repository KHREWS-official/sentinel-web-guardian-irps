
import React from 'react';

const PoppinsAnimation = () => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center font-poppins">
      <div className="text-center">
        <div className="animate-pulse">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 animate-bounce">
            IRPS_295
          </h1>
          <div className="text-2xl md:text-4xl text-gradient bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent font-semibold mb-8 animate-pulse">
            Dedicated to Allama Khadim Hussain Rizvi
          </div>
          <div className="text-xl md:text-2xl text-golden text-yellow-400 font-medium mb-4 animate-pulse">
            (The Courageous Leader)
          </div>
          <div className="flex justify-center items-center space-x-4 text-white text-lg animate-pulse">
            <span>🕌</span>
            <span>Enhanced Multi-Language Protection System</span>
            <span>🕌</span>
          </div>
          <div className="mt-8 text-sm text-gray-300 animate-pulse">
            🌐 Supporting: English | العربية | اردو | हिंदी
          </div>
        </div>
        
        {/* Islamic geometric pattern background */}
        <div className="absolute inset-0 opacity-10">
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-96 h-96 relative">
              {/* Geometric Islamic pattern */}
              <div className="absolute inset-0 border-4 border-green-400 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-4 border-2 border-blue-400 rounded-full animate-spin-reverse"></div>
              <div className="absolute inset-8 border-2 border-purple-400 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-12 border-1 border-yellow-400 rounded-full animate-spin-reverse"></div>
              
              {/* Central star pattern */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 6s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PoppinsAnimation;
