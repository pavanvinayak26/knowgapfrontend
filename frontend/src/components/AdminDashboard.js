import React, { useState, useEffect } from "react";
import QuizService from "../services/quiz.service";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";

const AdminDashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [topics, setTopics] = useState([]);
  
  const [newSubject, setNewSubject] = useState({ name: "", description: "" });
  const [newTopic, setNewTopic] = useState({ name: "", subjectId: "" });
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "A",
    topicId: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (!user || user.role !== "ROLE_ADMIN") {
      navigate("/dashboard");
      return;
    }
    loadSubjects();
  }, [navigate]);

  const loadSubjects = () => {
    QuizService.getSubjects().then(res => setSubjects(res.data));
  };

  const handleSubjectChange = (e) => {
    const val = e.target.value;
    
    if (e.target.id === "subjectSelectTopic") {
        setNewTopic({ ...newTopic, subjectId: val });
    } else {
        setSelectedSubjectId(val);
        if (val) {
            QuizService.getTopicsBySubject(val).then(res => setTopics(res.data));
        } else {
            setTopics([]);
        }
    }
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    setLoading(true);
    QuizService.addSubject(newSubject).then(
      () => {
        setMessage("Subject added successfully!");
        setNewSubject({ name: "", description: "" });
        loadSubjects();
        setLoading(false);
      },
      () => { setMessage("Error adding subject"); setLoading(false); }
    );
  };

  const handleAddTopic = (e) => {
    e.preventDefault();
    if (!newTopic.subjectId) { setMessage("Please select a subject"); return; }
    setLoading(true);
    
    // Construct the actual topic object the backend expects
    const topicData = { 
        name: newTopic.name, 
        subject: { id: parseInt(newTopic.subjectId) } 
    };

    QuizService.addTopic(topicData).then(
      () => {
        setMessage("Topic added successfully!");
        setNewTopic({ name: "", subjectId: "" });
        setLoading(false);
      },
      () => { setMessage("Error adding topic"); setLoading(false); }
    );
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQuestion.topicId) { setMessage("Please select a topic"); return; }
    setLoading(true);
    QuizService.addQuestion(newQuestion).then(
      () => {
        setMessage("Question added successfully!");
        setNewQuestion({
          text: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctOption: "A",
          topicId: newQuestion.topicId
        });
        setLoading(false);
      },
      () => { setMessage("Error adding question"); setLoading(false); }
    );
  };

  return (
    <div style={{ padding: '4rem 2rem' }} className="fade-in">
      <div className="glass-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 className="title" style={{ textAlign: 'left', marginBottom: '2.5rem' }}>Admin Control Center</h2>
        
        {message && <div className="alert alert-info">{message}</div>}

        <div className="dashboard-grid">
          
          {/* Add Subject */}
          <div className="admin-card">
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>New Subject</h3>
            <form onSubmit={handleAddSubject}>
              <div className="form-group">
                <input type="text" placeholder="Subject Name (e.g. Python)" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} required className="form-control" />
              </div>
              <div className="form-group">
                <textarea placeholder="Tell us about this subject..." value={newSubject.description} onChange={e => setNewSubject({...newSubject, description: e.target.value})} required className="form-control" rows="3" />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>Create Subject</button>
            </form>
          </div>

          {/* Add Topic */}
          <div className="admin-card">
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>New Topic</h3>
            <form onSubmit={handleAddTopic}>
              <div className="form-group">
                <select id="subjectSelectTopic" value={newTopic.subjectId} onChange={handleSubjectChange} required className="form-control">
                  <option value="">Choose Parent Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <input type="text" placeholder="Topic Title (e.g. Loops)" value={newTopic.name} onChange={e => setNewTopic({...newTopic, name: e.target.value})} required className="form-control" />
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--accent) 100%)' }}>Create Topic</button>
            </form>
          </div>

          {/* Add Question */}
          <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>Knowledge Bank: Add Question</h3>
            <form onSubmit={handleAddQuestion}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <select value={selectedSubjectId} onChange={handleSubjectChange} className="form-control">
                    <option value="">Filter by Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <select value={newQuestion.topicId} onChange={e => setNewQuestion({...newQuestion, topicId: e.target.value})} required className="form-control">
                    <option value="">Select Target Topic</option>
                    {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <textarea placeholder="Write the question text here..." value={newQuestion.text} onChange={e => setNewQuestion({...newQuestion, text: e.target.value})} required className="form-control" rows="3" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <input type="text" placeholder="Option A" value={newQuestion.optionA} onChange={e => setNewQuestion({...newQuestion, optionA: e.target.value})} required className="form-control" />
                <input type="text" placeholder="Option B" value={newQuestion.optionB} onChange={e => setNewQuestion({...newQuestion, optionB: e.target.value})} required className="form-control" />
                <input type="text" placeholder="Option C" value={newQuestion.optionC} onChange={e => setNewQuestion({...newQuestion, optionC: e.target.value})} required className="form-control" />
                <input type="text" placeholder="Option D" value={newQuestion.optionD} onChange={e => setNewQuestion({...newQuestion, optionD: e.target.value})} required className="form-control" />
              </div>
              <div className="form-group" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ marginBottom: 0 }}>Correct Answer Key:</label>
                <select value={newQuestion.correctOption} onChange={e => setNewQuestion({...newQuestion, correctOption: e.target.value})} className="form-control" style={{ width: '120px' }}>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: 'auto', padding: '1rem 3rem' }}>Deploy Question</button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
