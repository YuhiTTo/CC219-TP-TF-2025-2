"""
Script de diagnóstico para verificar que todo está correctamente configurado
Ejecutar: python check_setup.py
"""

import os
import sys

def check_dependencies():
    """Verificar que todas las dependencias están instaladas."""
    print("\n🔍 Verificando dependencias de Python...\n")
    
    dependencies = {
        "fastapi": "FastAPI",
        "uvicorn": "Uvicorn",
        "joblib": "Joblib",
        "sklearn": "Scikit-learn",
        "tensorflow": "TensorFlow",
        "transformers": "Transformers",
        "numpy": "NumPy"
    }
    
    missing = []
    for module, name in dependencies.items():
        try:
            __import__(module)
            print(f"✓ {name} instalado")
        except ImportError:
            print(f"✗ {name} NO instalado")
            missing.append(name)
    
    if missing:
        print(f"\n⚠️  Faltan dependencias: {', '.join(missing)}")
        print("Ejecuta: pip install -r requirements.txt")
        return False
    else:
        print("\n✓ Todas las dependencias están instaladas")
        return True

def check_model_files():
    """Verificar que los archivos de modelos existen."""
    print("\n🔍 Verificando archivos de modelos...\n")
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(base_dir, "models")
    
    required_files = {
        "LogReg": [
            os.path.join(models_dir, "logreg", "modelo_lr_entrenado.joblib"),
            os.path.join(models_dir, "logreg", "tfidf_vectorizer.joblib")
        ],
        "LSTM": [
            os.path.join(models_dir, "lstm", "tuning_modelo_lstm_entrenado.h5"),
            os.path.join(models_dir, "lstm", "tuning_tokenizer_lstm.pickle")
        ],
        "BERT": [
            os.path.join(models_dir, "bert", "config.json"),
            os.path.join(models_dir, "bert", "tf_model.h5"),
            os.path.join(models_dir, "bert", "tokenizer_config.json"),
            os.path.join(models_dir, "bert", "vocab.txt")
        ]
    }
    
    all_ok = True
    
    for model_name, files in required_files.items():
        print(f"\n📦 {model_name}:")
        model_ok = True
        for file_path in files:
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)
                size_mb = file_size / (1024 * 1024)
                print(f"  ✓ {os.path.basename(file_path)} ({size_mb:.2f} MB)")
            else:
                print(f"  ✗ {os.path.basename(file_path)} NO ENCONTRADO")
                print(f"     Ruta esperada: {file_path}")
                model_ok = False
        
        if not model_ok:
            all_ok = False
            print(f"  ⚠️  Modelo {model_name} incompleto")
    
    if not all_ok:
        print("\n⚠️  Faltan archivos de modelos. Asegúrate de copiar todos los archivos en:")
        print(f"   {models_dir}")
        print("\nEstructura esperada:")
        print("backend/")
        print("  models/")
        print("    logreg/")
        print("      modelo_lr_entrenado.joblib")
        print("      tfidf_vectorizer.joblib")
        print("    lstm/")
        print("      tuning_modelo_lstm_entrenado.h5")
        print("      tuning_tokenizer_lstm.pickle")
        print("    bert/")
        print("      config.json")
        print("      tf_model.h5")
        print("      tokenizer_config.json")
        print("      special_tokens_map.json")
        print("      vocab.txt")
    
    return all_ok

def check_directories():
    """Verificar que las carpetas existen."""
    print("\n🔍 Verificando estructura de directorios...\n")
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(base_dir, "models")
    
    dirs_to_check = [
        models_dir,
        os.path.join(models_dir, "logreg"),
        os.path.join(models_dir, "lstm"),
        os.path.join(models_dir, "bert")
    ]
    
    all_exist = True
    for dir_path in dirs_to_check:
        if os.path.exists(dir_path) and os.path.isdir(dir_path):
            print(f"✓ {os.path.relpath(dir_path, base_dir)}/")
        else:
            print(f"✗ {os.path.relpath(dir_path, base_dir)}/ NO EXISTE")
            all_exist = False
    
    if not all_exist:
        print("\n⚠️  Crea las carpetas faltantes y coloca tus modelos ahí")
    
    return all_exist

def main():
    """Ejecutar todos los chequeos."""
    print("=" * 60)
    print("🔧 DIAGNÓSTICO DE CONFIGURACIÓN DEL BACKEND")
    print("=" * 60)
    
    # Verificar Python version
    print(f"\n🐍 Python: {sys.version}")
    
    # Ejecutar chequeos
    deps_ok = check_dependencies()
    dirs_ok = check_directories()
    files_ok = check_model_files()
    
    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN")
    print("=" * 60)
    
    if deps_ok and dirs_ok and files_ok:
        print("\n✅ TODO ESTÁ CORRECTO")
        print("\nPuedes iniciar el servidor con:")
        print("   python -m uvicorn main:app --reload")
    else:
        print("\n❌ HAY PROBLEMAS QUE RESOLVER")
        if not deps_ok:
            print("   • Instala las dependencias: pip install -r requirements.txt")
        if not dirs_ok:
            print("   • Crea las carpetas de modelos")
        if not files_ok:
            print("   • Coloca tus archivos de modelos en las carpetas correctas")
        print("\nDespués de resolver los problemas, ejecuta este script nuevamente.")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
