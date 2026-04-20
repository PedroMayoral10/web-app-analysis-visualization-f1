import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { URL_API_BACKEND } from "../../config.js";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });

  // Fotos de fondo para el carrusel
  const imagenesFondo = [
    '/foto_login_1.jpeg',
    '/foto_login_2.jpeg',
    '/foto_login_3.jpeg',
    '/foto_login_4.jpeg'
  ];

  // -Carrusel de imágenes de fondo con fundido suave-
  const [indiceImagen, setIndiceImagen] = useState(0);

  // Cambiar imagen cada 5 segundos
  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndiceImagen((prevIndice) => {
        return (prevIndice + 1) === imagenesFondo.length ? 0 : prevIndice + 1;
      });
    }, 5000); // Cambio cada 5 segundos

    return () => clearInterval(intervalo);
  }, []);

  const navigate = useNavigate();

  // Función para login como invitado
  const handleGuestLogin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/circuito-interactivo');
  };

  // Función para manejar el envío del formulario de login
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${URL_API_BACKEND}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success(`Bienvenido, ${data.user.username}`);
        navigate('/circuito-interactivo');
      } else {
        toast.error(data.error || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
    }
  };

  return (

    <div style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#000' }}>
      {imagenesFondo.map((foto, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url('${foto}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0, 
            opacity: index === indiceImagen ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out'
          }}
        />
      ))}

      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 1
      }}></div>

      {/* FORMULARIO */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 2
      }}>

        <div className="card border-danger p-4 text-white shadow" style={{
          width: '400px',
          backgroundColor: 'rgba(0, 0, 0, 0.75)', 
        }}>
          <h2 className="text-center mb-4 text-danger fw-bold">LOGIN F1</h2>
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <input
              name="username" type="text" placeholder="Usuario"
              className="form-control" required
              onChange={e => setFormData({ ...formData, username: e.target.value })}
            />
            <input
              name="password" type="password" placeholder="Contraseña"
              className="form-control" required
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
            <button type="submit" className="btn btn-danger fw-bold mt-2">ENTRAR A PISTA</button>
          </form>
          <div className="mt-3">
            <button
              onClick={handleGuestLogin}
              className="btn btn-outline-light w-100 fw-bold btn-sm"
            >
              🚀 Entrar como Invitado
            </button>
          </div>
          <div className="mt-3 text-center">
            <small>¿No tienes cuenta? <Link to="/register" className="text-white">Regístrate</Link></small>
          </div>
        </div>

      </div>
    </div>
  );
}