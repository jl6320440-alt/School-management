import React, { useRef, useEffect } from "react";
import * as THREE from "three";

interface ThreePanelProps {
  width?: number;
  height?: number;
}

export const ThreePanel: React.FC<ThreePanelProps> = ({
  width = 400,
  height = 240,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1.6, 0.6, 0.3);
    const material = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      metalness: 0.3,
      roughness: 0.4,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    let req = 0;
    const animate = () => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.02;
      renderer.render(scene, camera);
      req = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(req);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [width, height]);

  return <div ref={mountRef} style={{ width, height }} />;
};

export default ThreePanel;
