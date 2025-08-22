import React, { useState, useEffect, useCallback } from 'react';
// import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import type { Event, EventResponse } from '../types';
import './EventResponse.css';

const EventResponsePage: React.FC = () => {
  // const { t } = useLanguage();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittingEventId, setSubmittingEventId] = useState<number | null>(
    null
  );
  const [eventResponses, setEventResponses] = useState<{
    [eventId: number]: EventResponse[];
  }>({});
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
  const [loadingResponses, setLoadingResponses] = useState<number | null>(null);

  // Check if user is team member (NOR group)
  const isTeamMember = user?.group_code === 'NOR';
  const supporterId = user?.id;

  const fetchUserEvents = useCallback(async () => {
    if (!supporterId) return;

    try {
      setLoading(true);
      setError(null);
      const eventsData = await apiService.getUserEvents(supporterId);
      setEvents(eventsData);
    } catch (err) {
      console.error('Error fetching user events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [supporterId]);

  useEffect(() => {
    if (isTeamMember && supporterId) {
      fetchUserEvents();
    }
  }, [isTeamMember, supporterId, fetchUserEvents]);

  const handleResponseSubmit = async (
    eventId: number,
    attendanceStatus: 'Join' | 'Not Able' | 'Not Decide'
  ) => {
    if (!supporterId) return;

    try {
      setSubmittingEventId(eventId);
      setError(null);

      await apiService.submitEventResponse(eventId, {
        supporter_id: supporterId,
        attendance_status: attendanceStatus,
      });

      // Refresh events to show updated response and summary
      await fetchUserEvents();

      // If this event's responses are currently expanded, refresh them too
      if (expandedEventId === eventId && eventResponses[eventId]) {
        await fetchEventResponses(eventId);
      }
    } catch (err) {
      console.error('Error submitting event response:', err);
      setError('Failed to submit response');
    } finally {
      setSubmittingEventId(null);
    }
  };

  const fetchEventResponses = async (eventId: number) => {
    try {
      setLoadingResponses(eventId);
      const responses = await apiService.getEventResponses(eventId);
      setEventResponses(prev => ({
        ...prev,
        [eventId]: responses,
      }));
    } catch (err) {
      console.error('Error fetching event responses:', err);
      setError('Failed to load team member responses');
    } finally {
      setLoadingResponses(null);
    }
  };

  const handleToggleEventResponses = async (eventId: number) => {
    if (expandedEventId === eventId) {
      // Collapse
      setExpandedEventId(null);
    } else {
      // Expand and fetch responses if not already cached
      setExpandedEventId(eventId);
      if (!eventResponses[eventId]) {
        await fetchEventResponses(eventId);
      }
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

  // Get response button classes
  const getResponseButtonClasses = (
    currentResponse: 'Join' | 'Not Able' | 'Not Decide' | null | undefined,
    buttonType: 'Join' | 'Not Able' | 'Not Decide'
  ) => {
    const isSelected = currentResponse === buttonType;
    const baseClasses = 'response-button';

    if (isSelected) {
      switch (buttonType) {
        case 'Join':
          return `${baseClasses} selected join`;
        case 'Not Able':
          return `${baseClasses} selected not-able`;
        case 'Not Decide':
          return `${baseClasses} selected not-decide`;
        default:
          return baseClasses;
      }
    } else {
      return `${baseClasses} unselected`;
    }
  };

  if (!isTeamMember) {
    return (
      <div className="container">
        <div className="card">
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>Only team members (NOR group) can access event responses.</p>
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
      <h1 className="page-title">Event Responses</h1>

      {error && (
        <div className="card event-response-error">
          <div className="event-response-error-text">{error}</div>
        </div>
      )}

      <div className="card">
        <h2 className="events-section-title">Upcoming Events</h2>

        {events.length === 0 ? (
          <div className="events-empty-state">
            No upcoming events at the moment.
          </div>
        ) : (
          <div className="events-list">
            {events.map(event => (
              <div key={event.id} className="event-item">
                <div className="event-header">
                  <h3 className="event-name">{event.event_name}</h3>
                  <p className="event-date">
                    📅 {formatDate(event.event_date)}
                  </p>
                  {event.creator && (
                    <p className="event-creator">
                      👤 Created by: {event.creator.name}
                    </p>
                  )}
                </div>

                {/* Summary Section - Always Visible */}
                <div className="summary-section">
                  <h4 className="summary-title">Team Response Summary</h4>
                  {event.summary ? (
                    <div className="summary-stats">
                      <div className="summary-stat">
                        <div className="summary-stat-number joining">
                          {event.summary.total_join}
                        </div>
                        <div className="summary-stat-label">Joining</div>
                      </div>
                      <div className="summary-stat">
                        <div className="summary-stat-number not-able">
                          {event.summary.total_not_able}
                        </div>
                        <div className="summary-stat-label">Not Able</div>
                      </div>
                      <div className="summary-stat">
                        <div className="summary-stat-number not-decided">
                          {event.summary.total_not_decide}
                        </div>
                        <div className="summary-stat-label">Not Decided</div>
                      </div>
                      <div className="summary-stat">
                        <div className="summary-stat-number total">
                          {event.summary.total_responses}
                        </div>
                        <div className="summary-stat-label">
                          Total Responses
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="summary-no-data">
                      No response data available yet.
                    </div>
                  )}
                </div>

                <div className="user-response-section">
                  <h4 className="user-response-title">Your Response:</h4>
                  {event.user_response ? (
                    <div className="user-response-current">
                      <span
                        className={`user-response-badge ${event.user_response === 'Join' ? 'join' : event.user_response === 'Not Able' ? 'not-able' : 'not-decide'}`}
                      >
                        {event.user_response}
                      </span>
                      <p className="user-response-help-text">
                        You can change your response by clicking a different
                        option below.
                      </p>
                    </div>
                  ) : (
                    <p className="user-response-empty">
                      You haven't responded yet.
                    </p>
                  )}
                </div>

                <div className="update-response-section">
                  <h4 className="update-response-title">
                    Update Your Response:
                  </h4>
                  <div className="update-response-buttons">
                    {(['Join', 'Not Able', 'Not Decide'] as const).map(
                      responseType => (
                        <button
                          key={responseType}
                          onClick={() =>
                            handleResponseSubmit(event.id, responseType)
                          }
                          disabled={submittingEventId === event.id}
                          className={getResponseButtonClasses(
                            event.user_response,
                            responseType
                          )}
                        >
                          {submittingEventId === event.id
                            ? 'Saving...'
                            : responseType}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Team Members' Responses Section */}
                <div className="team-responses-section">
                  <div className="team-responses-header">
                    <h4 className="team-responses-title">
                      All Team Members' Responses
                    </h4>
                    <button
                      onClick={() => handleToggleEventResponses(event.id)}
                      disabled={loadingResponses === event.id}
                      className="team-responses-toggle"
                    >
                      {loadingResponses === event.id
                        ? 'Loading...'
                        : expandedEventId === event.id
                          ? 'Hide Responses'
                          : 'Show All Responses'}
                    </button>
                  </div>

                  {expandedEventId === event.id && (
                    <div className="team-responses-content">
                      {eventResponses[event.id] &&
                      eventResponses[event.id].length > 0 ? (
                        <div className="team-responses-table-container">
                          <table className="team-responses-table">
                            <thead>
                              <tr>
                                <th className="left">Name</th>
                                <th className="left">Group</th>
                                <th className="center">Response</th>
                                <th className="center">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {eventResponses[event.id].map(response => (
                                <tr key={response.id}>
                                  <td>{response.supporter?.name}</td>
                                  <td>
                                    <span className="supporter-group-badge">
                                      {response.supporter?.group_code}
                                    </span>
                                  </td>
                                  <td className="center">
                                    <span
                                      className={`response-status-badge ${
                                        response.attendance_status === 'Join'
                                          ? 'join'
                                          : response.attendance_status ===
                                              'Not Able'
                                            ? 'not-able'
                                            : 'not-decide'
                                      }`}
                                    >
                                      {response.attendance_status}
                                    </span>
                                  </td>
                                  <td className="center muted">
                                    {new Date(
                                      response.updated_at
                                    ).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Summary Section */}
                          <div className="expanded-summary">
                            <div className="expanded-summary-stat">
                              <div className="expanded-summary-number joining">
                                {
                                  eventResponses[event.id].filter(
                                    r => r.attendance_status === 'Join'
                                  ).length
                                }
                              </div>
                              <div className="expanded-summary-label">
                                Joining
                              </div>
                            </div>
                            <div className="expanded-summary-stat">
                              <div className="expanded-summary-number not-able">
                                {
                                  eventResponses[event.id].filter(
                                    r => r.attendance_status === 'Not Able'
                                  ).length
                                }
                              </div>
                              <div className="expanded-summary-label">
                                Not Able
                              </div>
                            </div>
                            <div className="expanded-summary-stat">
                              <div className="expanded-summary-number not-decided">
                                {
                                  eventResponses[event.id].filter(
                                    r => r.attendance_status === 'Not Decide'
                                  ).length
                                }
                              </div>
                              <div className="expanded-summary-label">
                                Not Decided
                              </div>
                            </div>
                            <div className="expanded-summary-stat">
                              <div className="expanded-summary-number total">
                                {eventResponses[event.id].length}
                              </div>
                              <div className="expanded-summary-label">
                                Total Responses
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="team-responses-empty">
                          No responses from team members yet.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Legend */}
      <div className="card response-legend">
        <h3 className="response-legend-title">Response Options:</h3>
        <div className="response-legend-items">
          <div className="response-legend-item">
            <div className="response-legend-color join" />
            <span className="response-legend-text">
              <strong>Join</strong> - I will attend the event
            </span>
          </div>
          <div className="response-legend-item">
            <div className="response-legend-color not-able" />
            <span className="response-legend-text">
              <strong>Not Able</strong> - I cannot attend the event
            </span>
          </div>
          <div className="response-legend-item">
            <div className="response-legend-color not-decide" />
            <span className="response-legend-text">
              <strong>Not Decide</strong> - I haven't decided yet
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventResponsePage;
