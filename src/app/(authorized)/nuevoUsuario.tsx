import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, TextInput, View } from "react-native";
import className from "twrnc";

interface Usuario {
  key: string;
  nombre: string;
  email: string;
  rol: string;
}
            // cambiar en base a tu ip
const API_URL = "http://localhost:8090/usuarios";

const nuevoUsuario = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState('Promotor'); 
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carga, setCarga] = useState<boolean>(false)
  const [editBoton, setEditBoton] = useState<string | null>(null);

  const cargarUsuarios = async () => {
    setCarga(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('error obteniendo a los usuarios');
      const datos = await response.json();

      const usuarioMapeado: Usuario[] = datos.map((u: any) => ({
        key: u.idUsuario ? u.idUsuario.toString() : String(Math.random()),
        nombre: u.nombre,
        email: u.correo,
        rol: u.rol,
      }));
      setUsuarios(usuarioMapeado);
    } catch (error) {
      console.error(error);
    } finally {
      setCarga(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

    const agregarUsuario = async () => {
        if (!nombre.trim() || !email.trim() || (!editBoton && !contrasena.trim())){
            Alert.alert("Atencion","Completa los campos");
            return;
        }
        if (editBoton !== null) {
            setUsuarios(usuarios.map(item =>
                item.key === editBoton
                ? { key: item.key, nombre, email, rol}
                : item
            ));
            setEditBoton(null);
            limpiarFormulario();
        } else {
            try{
                setCarga(true);
                const payload = {
                    nombre,
                    correo: email,
                    contrasena,
                    rol: rol.toLowerCase()
                };

                const response = await fetch(`${API_URL}/registro`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) throw new Error("error al registrar nuevo usuario");

                const usuarioCreado = await response.json();

                const idObtenido = usuarioCreado?.idUsuario ?? usuarioCreado?.id;

const nuevoUsuarioFormateado: Usuario = {
  key: idObtenido ? idObtenido.toString() : Date.now().toString(),
  nombre: usuarioCreado.nombre,
  email: usuarioCreado.correo,
  rol: usuarioCreado.rol
};

                setUsuarios([...usuarios, nuevoUsuarioFormateado]);
                limpiarFormulario();
            } catch (error) {
                console.error(error);
            } finally {
                setCarga(false);
            }
        }
    };

    const borrarUsuario = (key: string) => {
        setUsuarios(usuarios.filter(item => item.key !== key));
    };

    const editarUsuario = (item: Usuario) => {
        setNombre(item.nombre);
        setEmail(item.email);
        setRol(item.rol);
        setEditBoton(item.key);
    };

    const limpiarFormulario = () => {
        setNombre('');
        setEmail('');
        setContrasena('');
        setRol('promotor');
    };
    
return (
    <View style={className`p-4 gap-3 flex-1 bg-gray-100`}>
      <Text style={className`text-2xl font-bold text-gray-800`}>
        Gestión de Usuarios
      </Text>

      <View style={className`bg-white p-3 rounded-xl shadow-sm gap-2`}>
        <TextInput
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre completo"
          style={className`bg-gray-100 rounded-lg p-3 text-base text-gray-800`}
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Correo electrónico"
          keyboardType="email-address"
          autoCapitalize="none"
          style={className`bg-gray-100 rounded-lg p-3 text-base text-gray-800`}
        />

        
        {!editBoton && (
          <TextInput
            value={contrasena}
            onChangeText={setContrasena}
            placeholder="Contraseña"
            secureTextEntry
            style={className`bg-gray-100 rounded-lg p-3 text-base text-gray-800`}
          />
        )}

        <View style={className`flex-row gap-2 my-1`}>
          <Pressable
            onPress={() => setRol('promotor')}
            style={className`flex-1 p-3 rounded-lg items-center ${
              rol.toLowerCase() === 'promotor' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <Text
              style={className`font-semibold ${
                rol.toLowerCase() === 'promotor' ? 'text-white' : 'text-gray-700'
              }`}
            >
              Promotor
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setRol('supervisor')}
            style={className`flex-1 p-3 rounded-lg items-center ${
              rol.toLowerCase() === 'supervisor' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <Text
              style={className`font-semibold ${
                rol.toLowerCase() === 'supervisor' ? 'text-white' : 'text-gray-700'
              }`}
            >
              Supervisor
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={className`p-3 bg-blue-600 rounded-lg items-center justify-center mt-1`}
          onPress={agregarUsuario}
          disabled={carga}
        >
          {carga ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={className`text-base font-bold text-white`}>
              {editBoton !== null ? 'Actualizar Usuario' : 'Crear Usuario'}
            </Text>
          )}
        </Pressable>
      </View>

      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.key}
        onRefresh={cargarUsuarios}
        refreshing={carga}
        renderItem={({ item }) => (
          <View style={className`gap-2 my-1 bg-white p-3 rounded-xl shadow-sm`}>
            <View style={className`flex-row justify-between items-center`}>
              <View style={className`flex-1 flex-row items-center gap-2`}>
                <Text style={className`text-xs bg-gray-200 text-gray-700 font-bold px-2 py-1 rounded-md`}>
                  #{item.key}
                </Text>
                <View>
                  <Text style={className`text-lg font-semibold text-gray-800`}>
                    {item.nombre}
                  </Text>
                  <Text style={className`text-sm text-gray-500`}>
                    {item.email}
                  </Text>
                </View>
              </View>
              <Text style={className`text-xs bg-blue-100 text-blue-800 font-medium px-2 py-1 rounded-full capitalize`}>
                {item.rol}
              </Text>
            </View>

            <View style={className`flex-row justify-center items-center gap-2 mt-2`}>
              <Pressable
                onPress={() => editarUsuario(item)}
                style={className`p-2 bg-blue-500 rounded-lg flex-1 items-center`}
              >
                <Text style={className`text-white font-medium`}>Editar</Text>
              </Pressable>

              <Pressable
                onPress={() => borrarUsuario(item.key)}
                style={className`p-2 bg-red-500 rounded-lg flex-1 items-center`}
              >
                <Text style={className`text-white font-medium`}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
};
    
export default nuevoUsuario;
  