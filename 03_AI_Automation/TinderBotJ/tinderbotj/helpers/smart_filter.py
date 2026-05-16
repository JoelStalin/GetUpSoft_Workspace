import re

class SmartFilter:
    """
    Filtro inteligente para analizar perfiles de Tinder.
    Analiza biografías y datos para detectar palabras clave o patrones específicos.
    """

    def __init__(self):
        # Palabras clave relacionadas con perfiles transgenero (en varios idiomas comunes)
        # Esto es un filtro heurístico basado en texto.
        self.trans_keywords = [
            r'\btrans\b', r'\btransgender\b', r'\btranssexual\b', 
            r'\bts\b', r'\btv\b', r'\bcd\b', r'\bcrossdresser\b',
            r'\bmtf\b', r'\bftm\b', r'\bladyboy\b', r'\bshemale\b',
            r'\bt-girl\b', r'\btgirl\b', r'\btwoman\b', 
            r'\btransexual\b', r'\btravesti\b', r'\btrans genero\b',
            r'\bmujer trans\b', r'\bhombro trans\b',
            r'\bnon-binary\b', r'\bno binario\b', r'\benby\b'
        ]
        
        # Palabras clave positivas para "entrenamiento" (placeholders)
        self.positive_keywords = []
        self.negative_keywords = []

    def load_training_data(self):
        """
        Carga palabras clave de perfiles que el usuario ha dado 'Like' anteriormente.
        (Simulado por ahora con una lista estática, idealmente leería de un archivo)
        """
        # TODO: Implementar carga desde archivo JSON o similar
        self.positive_keywords = ["gym", "travel", "music", "pizza", "dog"]
        self.negative_keywords = ["smoke", "drugs", "party"]

    def is_suspected_trans(self, bio_text):
        """
        Devuelve True si la biografía contiene palabras clave relacionadas con transgénero.
        """
        if not bio_text:
            return False
            
        bio_lower = bio_text.lower()
        for pattern in self.trans_keywords:
            if re.search(pattern, bio_lower):
                return True
        return False

    def check_compatibility(self, bio_text):
        """
        Analiza si el perfil es compatible basado en palabras clave positivas/negativas.
        Devuelve un puntaje (score) simple.
        """
        if not bio_text:
            return 0
            
        score = 0
        bio_lower = bio_text.lower()
        
        for word in self.positive_keywords:
            if word in bio_lower:
                score += 1
                
        for word in self.negative_keywords:
            if word in bio_lower:
                score -= 10 # Penalización fuerte
                
        return score
