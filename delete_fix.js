// Function de suppression corrigée pour AdminDashboard.tsx
// Remplacer la fonction handleDeleteNews existante par cette version

const handleDeleteNews = async (id) => {
  console.log('DELETE - Tentative de suppression de la news ID:', id);
  try {
    // Convertir l'ID en number car la DB attend un number
    const newsId = parseInt(id, 10);
    if (isNaN(newsId)) {
      throw new Error(`ID invalide: ${id}`);
    }

    console.log('DELETE - Suppression directe de la news ID:', newsId);
    const { error, count } = await supabase
      .from('news')
      .delete({ count: 'exact' })
      .eq('id', newsId);

    if (error) {
      console.error('DELETE - Erreur Supabase:', error);
      throw error;
    }

    console.log('DELETE - Nombre de lignes supprimées:', count);
    
    if (count === 0) {
      throw new Error('Aucune ligne supprimée - vérifiez les permissions RLS');
    }

    console.log('DELETE - Suppression réussie, rechargement...');
    await fetchNews();
    console.log('DELETE - Données rechargées');
  } catch (error) {
    console.error('DELETE - Erreur:', error);
    throw error;
  }
};

// Aussi, exécutez cette requête SQL dans Supabase pour corriger les permissions :

/*
-- Supprimer l'ancienne politique
DROP POLICY IF EXISTS "admins_can_delete_news" ON "public"."news";
DROP POLICY IF EXISTS "test_delete_news" ON "public"."news";

-- Créer la politique corrigée
CREATE POLICY "admins_can_delete_news" ON "public"."news"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'editor')
  )
);
*/