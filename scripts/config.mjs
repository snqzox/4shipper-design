// Figma file configuration.
// Keys are taken from the file URLs; override via .env (FILE_KEY_*) if they ever change.

export const FILES = {
  uiKit: {
    key: process.env.FILE_KEY_UIKIT || 'XVou4XJ4rWbt4oXoSxO7hO',
    name: 'Transportly UI Kit 2.0',
    role: 'library',
  },
  design: {
    key: process.env.FILE_KEY_DESIGN || 'Xol48qmGXL8hIqA42jbHno',
    name: 'Transportly 4Shipper — Design',
    role: 'design',
  },
}
