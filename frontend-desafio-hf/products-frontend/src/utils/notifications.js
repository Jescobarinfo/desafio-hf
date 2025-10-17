import Swal from 'sweetalert2';

export const showSuccess = (message, title = '¡Éxito!') => {
  Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    timer: 2000,
    showConfirmButton: false,
  });
};

export const showError = (message, title = 'Error') => {
  Swal.fire({
    icon: 'error',
    title: title,
    text: message,
    confirmButtonColor: '#d33',
  });
};

export const showConfirm = async (message, title = '¿Estás seguro?') => {
  const result = await Swal.fire({
    title: title,
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });
  return result.isConfirmed;
};

export const showLoading = (message = 'Procesando...') => {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const closeLoading = () => {
  Swal.close();
};