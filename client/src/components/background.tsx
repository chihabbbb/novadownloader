export default function Background() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-space-dark to-blue-900/20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-nova-purple/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
      <div 
        className="absolute top-3/4 right-1/4 w-96 h-96 bg-nova-cyan/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" 
        style={{ animationDelay: '2s' }}
      ></div>
      <div 
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-nova-pink/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" 
        style={{ animationDelay: '4s' }}
      ></div>
    </div>
  );
}
