import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

function RotatingKnot() {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;
    
    // Smoothly rotate the knot over time
    meshRef.current.rotation.x = timeRef.current * 0.15;
    meshRef.current.rotation.y = timeRef.current * 0.25;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[0.8, 0.25, 128, 16]} />
        <meshStandardMaterial 
          color="#8b5cf6" 
          emissive="#6d28d9"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </Float>
  );
}

export default function ThreeCanvas() {
  return (
    <div className="w-full h-[350px] md:h-[450px] flex items-center justify-center cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#c084fc" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#22d3ee" />
        <directionalLight position={[0, 5, 0]} intensity={0.5} />
        
        <RotatingKnot />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}
