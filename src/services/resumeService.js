import supabase from '../lib/supabase';

const BUCKET = 'e_summit_resumes';

const getUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw new Error(error.message);
  }

  if (!data?.user?.id) {
    throw new Error('No active user session.');
  }

  return data.user.id;
};

const getPublicResumeUrl = (filePath) => {
  if (!filePath) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data?.publicUrl || null;
};

const listResumes = async (resumeType) => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .eq('resume_type', resumeType)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

const uploadResume = async (resumeType, file) => {
  const userId = await getUserId();
  const fileName = file?.name || `resume-${Date.now()}`;
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${userId}/${resumeType}/${Date.now()}_${safeName}`;
  const contentType = file?.mimeType || file?.type || 'application/octet-stream';

  const response = await fetch(file.uri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase
    .storage
    .from(BUCKET)
    .upload(filePath, blob, { contentType, upsert: false });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data, error } = await supabase
    .from('resumes')
    .insert({
      user_id: userId,
      resume_type: resumeType,
      file_path: filePath,
      file_name: fileName,
      file_type: contentType,
      file_size: typeof file?.size === 'number' ? file.size : null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const deleteResume = async (resumeId, filePath) => {
  if (filePath) {
    const { error: removeError } = await supabase
      .storage
      .from(BUCKET)
      .remove([filePath]);

    if (removeError) {
      throw new Error(removeError.message);
    }
  }

  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', resumeId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

const listApplications = async (resumeId) => {
  const { data, error } = await supabase
    .from('resume_applications')
    .select('*')
    .eq('resume_id', resumeId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

const listAllApplications = async () => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('resume_applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

const addApplication = async ({ resumeId, companyName, role, status, notes }) => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('resume_applications')
    .insert({
      user_id: userId,
      resume_id: resumeId,
      company_name: companyName,
      role,
      status,
      notes,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const updateApplicationStatus = async (applicationId, status) => {
  const { data, error } = await supabase
    .from('resume_applications')
    .update({ status })
    .eq('id', applicationId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export default {
  listResumes,
  uploadResume,
  deleteResume,
  getPublicResumeUrl,
  listApplications,
  listAllApplications,
  addApplication,
  updateApplicationStatus,
};
