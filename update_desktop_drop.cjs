const fs = require('fs');
let code = fs.readFileSync('src/components/Desktop.tsx', 'utf8');

// I will add a drop handler to the desktop background
// The background is <div className="absolute inset-0 bg-cover bg-center"

const dropJs = `
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (window.confirm("Do you want to set this image as your wallpaper? (Cancel to save to My Documents/Pictures)")) {
          localStorage.setItem('custom_wallpaper', dataUrl);
          window.location.reload();
        } else {
          const files = JSON.parse(localStorage.getItem('my_documents_files') || '[]');
          files.push({
            id: Date.now().toString(),
            name: file.name,
            type: 'image',
            content: dataUrl,
            folder: 'Pictures'
          });
          localStorage.setItem('my_documents_files', JSON.stringify(files));
          alert('Image saved to My Documents > Pictures!');
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
`;

code = code.replace(
  "const [startOpen, setStartOpen] = useState(false);",
  "const [startOpen, setStartOpen] = useState(false);\n" + dropJs
);

code = code.replace(
  "className=\"absolute inset-0 bg-cover bg-center\"",
  "className=\"absolute inset-0 bg-cover bg-center\"\n        onDrop={handleDrop}\n        onDragOver={handleDragOver}"
);

// We need to also read the custom wallpaper 
// In Desktop.tsx: style={{ backgroundImage: `url(${profile?.wallpaper || 'https://images.unsplash.com/...'})` }}
// Wait, the wallpaper might be read from profile. We can override if custom_wallpaper exists.

code = code.replace(
  "backgroundImage: `url(${profile?.wallpaper || 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=2940&auto=format&fit=crop'})`",
  "backgroundImage: `url(${localStorage.getItem('custom_wallpaper') || profile?.wallpaper || 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=2940&auto=format&fit=crop'})`"
);

fs.writeFileSync('src/components/Desktop.tsx', code);
