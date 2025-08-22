import React, { useState, useEffect } from 'react';
// import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { getFutureSundayDates } from '../utils/dateUtils';
import type { Event, EventResponse, Supporter } from '../types';
import './EventManagement.css';

const EventManagement: React.FC = () => {
  // const { t } = useLanguage();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventResponses, setEventResponses] = useState<EventResponse[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingAttendance, setEditingAttendance] = useState(false);
  const [updatingResponseId, setUpdatingResponseId] = useState<number | null>(
    null
  );
  const [allSupporters, setAllSupporters] = useState<Supporter[]>([]);

  // Form state for creating new event
  const [newEvent, setNewEvent] = useState({
    event_name: '',
    event_date: '',
  });

  // Form state for editing existing event
  const [editForm, setEditForm] = useState({
    event_name: '',
    event_date: '',
  });

  // Check if user is admin
  const isAdmin = user?.group_code === 'ADM';

  useEffect(() => {
    if (isAdmin) {
      fetchEvents();
    }
  }, [isAdmin]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const eventsData = await apiService.getEvents();
      setEvents(eventsData.reverse());
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEvent.event_name.trim() || !newEvent.event_date) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await apiService.createEvent({
        event_name: newEvent.event_name.trim(),
        event_date: newEvent.event_date,
        created_by: user?.id,
      });

      // Reset form and refresh events
      setNewEvent({ event_name: '', event_date: '' });
      setShowCreateForm(false);
      await fetchEvents();
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleViewEventDetails = async (event: Event) => {
    try {
      setLoading(true);
      setError(null);
      const [responses, supporters] = await Promise.all([
        apiService.getEventResponses(event.id),
        apiService.getSupporters(),
      ]);
      setEventResponses(responses);
      setAllSupporters(supporters);
      setSelectedEvent(event);
      setEditingAttendance(false);
    } catch (err) {
      console.error('Error fetching event responses:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async (
    responseId: number,
    attendanceStatus: 'Join' | 'Not Able' | 'Not Decide'
  ) => {
    try {
      setUpdatingResponseId(responseId);
      setError(null);

      await apiService.updateEventResponse(responseId, {
        attendance_status: attendanceStatus,
      });

      // Refresh event responses
      if (selectedEvent) {
        const updatedResponses = await apiService.getEventResponses(
          selectedEvent.id
        );
        setEventResponses(updatedResponses);

        // Also refresh the events list to update summary
        await fetchEvents();
      }
    } catch (err) {
      console.error('Error updating attendance:', err);
      setError('Failed to update attendance');
    } finally {
      setUpdatingResponseId(null);
    }
  };

  const handleAddMemberResponse = async (
    supporterId: number,
    attendanceStatus: 'Join' | 'Not Able' | 'Not Decide'
  ) => {
    if (!selectedEvent) return;

    try {
      setLoading(true);
      setError(null);

      await apiService.submitEventResponse(selectedEvent.id, {
        supporter_id: supporterId,
        attendance_status: attendanceStatus,
      });

      // Refresh event responses
      const updatedResponses = await apiService.getEventResponses(
        selectedEvent.id
      );
      setEventResponses(updatedResponses);

      // Also refresh the events list to update summary
      await fetchEvents();
    } catch (err) {
      console.error('Error adding member response:', err);
      setError('Failed to add member response');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEditForm({
      event_name: event.event_name,
      event_date: event.event_date.split('T')[0], // Format date for input
    });
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingEvent || !editForm.event_name.trim() || !editForm.event_date) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await apiService.updateEvent(editingEvent.id, {
        event_name: editForm.event_name.trim(),
        event_date: editForm.event_date,
      });

      // Reset form and refresh events
      setEditingEvent(null);
      setEditForm({ event_name: '', event_date: '' });
      await fetchEvents();
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setEditForm({ event_name: '', event_date: '' });
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await apiService.deleteEvent(eventId);
      await fetchEvents();
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(null);
        setEventResponses([]);
      }
      if (editingEvent?.id === eventId) {
        setEditingEvent(null);
        setEditForm({ event_name: '', event_date: '' });
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get future Sunday dates for event creation/editing
  const futureSundayDates = getFutureSundayDates();

  // Auto-populate event name based on selected date
  const generateEventName = (dateString: string) => {
    if (!dateString) return '';
    return `${dateString}-Sunday-12:15 PM`;
  };

  if (!isAdmin) {
    return (
      <div className="container">
        <div className="card">
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>Only admin users can access event management.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading && events.length === 0) {
    return (
      <div className="container">
        <div className="loading-center">
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">Event Management</h1>

      {error && (
        <div className="card event-management-error">
          <div className="event-management-error-text">{error}</div>
        </div>
      )}

      {/* Create Event Section */}
      <div className="card create-event-section">
        <div className="create-event-header">
          <h2 className="create-event-title">Create New Event</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn btn-primary create-event-toggle"
          >
            {showCreateForm ? 'Cancel' : '+ Create Event'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateEvent} className="create-event-form">
            <div className="create-event-form-grid">
              <div className="form-group">
                <label className="form-label">Event Date</label>
                <select
                  value={newEvent.event_date}
                  onChange={e => {
                    const selectedDate = e.target.value;
                    setNewEvent(prev => ({
                      ...prev,
                      event_date: selectedDate,
                      event_name: generateEventName(selectedDate),
                    }));
                  }}
                  className="form-input form-select"
                  required
                >
                  <option value="">Select a Sunday</option>
                  {futureSundayDates.map(date => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Event Name *{' '}
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    (auto-populated when date selected)
                  </span>
                </label>
                <input
                  type="text"
                  value={newEvent.event_name}
                  onChange={e =>
                    setNewEvent(prev => ({
                      ...prev,
                      event_name: e.target.value,
                    }))
                  }
                  className="form-input"
                  placeholder="Will auto-populate as: YYYY-MM-DD-Sunday"
                  required
                />
              </div>
            </div>
            <div className="create-event-form-actions">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary create-event-submit"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Events List */}
      <div className="card events-list-section">
        <h2 className="events-list-title">All Events</h2>

        {events.length === 0 ? (
          <div className="events-empty-state">
            No events created yet. Create your first event above.
          </div>
        ) : (
          <div className="events-table-container">
            <table className="events-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Date</th>
                  <th className="center">Join</th>
                  <th className="center">Not Able</th>
                  <th className="center">Not Decide</th>
                  <th className="center">Total</th>
                  <th className="center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id}>
                    <td className="event-name-cell">{event.event_name}</td>
                    <td>{formatDate(event.event_date)}</td>
                    <td className="center">
                      <span className="summary-stat join">
                        {event.summary?.total_join || 0}
                      </span>
                    </td>
                    <td className="center">
                      <span className="summary-stat not-able">
                        {event.summary?.total_not_able || 0}
                      </span>
                    </td>
                    <td className="center">
                      <span className="summary-stat not-decide">
                        {event.summary?.total_not_decide || 0}
                      </span>
                    </td>
                    <td className="center summary-stat total">
                      {event.summary?.total_responses || 0}
                    </td>
                    <td className="center">
                      <div className="action-buttons">
                        <button
                          onClick={() => handleViewEventDetails(event)}
                          className="btn btn-secondary action-button view"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="btn action-button edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="btn btn-danger action-button delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Event Form */}
      {editingEvent && (
        <div className="card edit-event-section">
          <div className="edit-event-header">
            <h2 className="edit-event-title">Edit Event</h2>
            <button
              onClick={handleCancelEdit}
              className="btn btn-outline edit-event-cancel"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleUpdateEvent}>
            <div className="edit-event-form-grid">
              <div className="form-group">
                <label className="form-label"> Date</label>
                <select
                  value={editForm.event_date}
                  onChange={e => {
                    const selectedDate = e.target.value;
                    setEditForm(prev => ({
                      ...prev,
                      event_date: selectedDate,
                      event_name: generateEventName(selectedDate),
                    }));
                  }}
                  className="form-input form-select"
                  required
                >
                  <option value="">Select a Sunday</option>
                  {futureSundayDates.map(date => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Event Name *{' '}
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    (auto-populated when date selected)
                  </span>
                </label>
                <input
                  type="text"
                  value={editForm.event_name}
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      event_name: e.target.value,
                    }))
                  }
                  className="form-input"
                  placeholder="Will auto-populate as: YYYY-MM-DD-Sunday"
                  required
                />
              </div>
            </div>
            <div className="edit-event-form-actions">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary edit-event-submit"
              >
                {loading ? 'Updating...' : 'Update Event'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Event Details Modal/Section */}
      {selectedEvent && (
        <div className="card event-details-section">
          <div className="event-details-header">
            <h2 className="event-details-title">
              {selectedEvent.event_name} - Attendance Management
            </h2>
            <div className="event-details-actions">
              <button
                onClick={() => setEditingAttendance(!editingAttendance)}
                className="btn btn-primary event-details-toggle"
              >
                {editingAttendance ? 'View Mode' : 'Edit Attendance'}
              </button>
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  setEventResponses([]);
                  setEditingAttendance(false);
                }}
                className="btn btn-outline event-details-close"
              >
                Close
              </button>
            </div>
          </div>

          <p className="event-details-date">
            Date: {formatDate(selectedEvent.event_date)}
          </p>

          {/* Summary Stats */}
          {selectedEvent.summary && (
            <div className="summary-stats-section">
              <h4 className="summary-stats-title">Current Summary</h4>
              <div className="summary-stats-grid">
                <div className="summary-stats-item">
                  <div className="summary-stats-number joining">
                    {selectedEvent.summary.total_join}
                  </div>
                  <div className="summary-stats-label">Joining</div>
                </div>
                <div className="summary-stats-item">
                  <div className="summary-stats-number not-able">
                    {selectedEvent.summary.total_not_able}
                  </div>
                  <div className="summary-stats-label">Not Able</div>
                </div>
                <div className="summary-stats-item">
                  <div className="summary-stats-number not-decided">
                    {selectedEvent.summary.total_not_decide}
                  </div>
                  <div className="summary-stats-label">Not Decided</div>
                </div>
                <div className="summary-stats-item">
                  <div className="summary-stats-number total">
                    {selectedEvent.summary.total_responses}
                  </div>
                  <div className="summary-stats-label">Total Responses</div>
                </div>
              </div>
            </div>
          )}

          {/* Members without responses */}
          {editingAttendance && (
            <div className="add-members-section">
              <h3 className="add-members-title">
                Add Response for NOR Group Members
              </h3>
              {allSupporters.filter(
                supporter =>
                  supporter.group_code === 'NOR' &&
                  !eventResponses.some(
                    response => response.supporter_id === supporter.id
                  )
              ).length > 0 ? (
                <div className="add-members-table-container">
                  <table className="add-members-table">
                    <thead>
                      <tr>
                        <th>Member Name</th>
                        <th>Group</th>
                        <th className="center">Add Response</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allSupporters
                        .filter(
                          supporter =>
                            supporter.group_code === 'NOR' &&
                            !eventResponses.some(
                              response => response.supporter_id === supporter.id
                            )
                        )
                        .map(supporter => (
                          <tr key={supporter.id}>
                            <td>{supporter.name}</td>
                            <td>
                              <span className="member-group-badge">
                                {supporter.group_code}
                              </span>
                            </td>
                            <td className="center">
                              <div className="add-response-buttons">
                                {(
                                  ['Join', 'Not Able', 'Not Decide'] as const
                                ).map(status => (
                                  <button
                                    key={status}
                                    onClick={() =>
                                      handleAddMemberResponse(
                                        supporter.id,
                                        status
                                      )
                                    }
                                    disabled={loading}
                                    className={`add-response-button ${
                                      status === 'Join'
                                        ? 'join'
                                        : status === 'Not Able'
                                          ? 'not-able'
                                          : 'not-decide'
                                    }`}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="add-members-empty">
                  All NOR group members have already responded to this event.
                </p>
              )}
            </div>
          )}

          {/* Existing responses */}
          <h3
            style={{
              fontSize: '1.125rem',
              marginBottom: '0.5rem',
              color: '#374151',
            }}
          >
            NOR Group Member Responses{' '}
            {editingAttendance && '(Click to Update)'}
          </h3>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '1rem',
            }}
          >
            Event responses are limited to NOR group members only. Admin users
            are excluded from attendance tracking.
          </p>

          {eventResponses.filter(
            response => response.supporter?.group_code === 'NOR'
          ).length === 0 ? (
            <div
              style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}
            >
              No NOR group responses yet for this event.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                      Supporter Name
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                      Group
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>
                      Response
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>
                      Response Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {eventResponses
                    .filter(
                      response => response.supporter?.group_code === 'NOR'
                    )
                    .map(response => (
                      <tr
                        key={response.id}
                        style={{ borderBottom: '1px solid #e5e7eb' }}
                      >
                        <td style={{ padding: '0.75rem' }}>
                          {response.supporter?.name}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span
                            style={{
                              padding: '0.125rem 0.375rem',
                              backgroundColor: '#f3f4f6',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 'medium',
                            }}
                          >
                            {response.supporter?.group_code}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          {editingAttendance ? (
                            <div
                              style={{
                                display: 'flex',
                                gap: '0.25rem',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                              }}
                            >
                              {(
                                ['Join', 'Not Able', 'Not Decide'] as const
                              ).map(status => (
                                <button
                                  key={status}
                                  onClick={() =>
                                    handleUpdateAttendance(response.id, status)
                                  }
                                  disabled={updatingResponseId === response.id}
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    fontSize: '0.75rem',
                                    border:
                                      response.attendance_status === status
                                        ? '2px solid #374151'
                                        : '1px solid transparent',
                                    borderRadius: '0.25rem',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    backgroundColor:
                                      status === 'Join'
                                        ? '#059669'
                                        : status === 'Not Able'
                                          ? '#dc2626'
                                          : '#d97706',
                                    opacity:
                                      updatingResponseId === response.id
                                        ? 0.6
                                        : 1,
                                  }}
                                >
                                  {updatingResponseId === response.id
                                    ? '...'
                                    : status}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span
                              style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                color: 'white',
                                backgroundColor:
                                  response.attendance_status === 'Join'
                                    ? '#059669'
                                    : response.attendance_status === 'Not Able'
                                      ? '#dc2626'
                                      : '#d97706',
                              }}
                            >
                              {response.attendance_status}
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: '0.75rem',
                            textAlign: 'center',
                            color: '#6b7280',
                          }}
                        >
                          {new Date(response.updated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventManagement;
