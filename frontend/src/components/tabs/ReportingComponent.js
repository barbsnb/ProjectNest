import React, { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import client from "../../axiosClient";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import DatePicker from "react-datepicker";
import "./ReportingComponent.css";
import "react-datepicker/dist/react-datepicker.css";

import moment from "moment";

const ReportingComponent = () => {
    const { currentUser } = useContext(AuthContext);
    const [reportType, setReportType] = useState('');
    const [userId, setUserId] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState('');

    const handleReportTypeChange = (e) => {
        setReportType(e.target.value);
        setReportData(null);
        setError('');
    };

    const handleUserIdChange = (e) => {
        setUserId(e.target.value);
    };

    const fetchReportData = async () => {
        let url = '';
        if (reportType === 'guestList') {
            url = `/api/user/${userId}/guests/`;
        } else if (reportType === 'receptionStats') {
            const formattedStartDate = moment(startDate).format('YYYY-MM-DD');
            const formattedEndDate = moment(endDate).format('YYYY-MM-DD');
            url = `/api/reception/stats/?start_date=${formattedStartDate}&end_date=${formattedEndDate}`;
        } else if (reportType === 'monthlyReport') {
            const year = moment(startDate).format('YYYY');
            const month = moment(startDate).format('MM');
            url = `/api/monthly/report/${year}/${month}/`;
        }

        try {
            const response = await client.get(url);
            setReportData(response.data);
            setError('');
        } catch (error) {
            setReportData(null);
            if (error.response) {
                setError(error.response.data.error || 'There was an error fetching the report!');
            } else {
                setError('There was an error fetching the report!');
            }
        }
    };

    const renderTable = () => {
        if (!reportData) return null;

        if (reportType === 'guestList') {
            return (
                <table className="visits-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Imię gościa</th>
                        <th>Nazwisko gościa</th>
                        <th>Data wizyty</th>
                    </tr>
                    </thead>
                    <tbody>
                    {reportData.guests.map(guest => (
                        <tr key={guest.id}>
                            <td>{guest.id}</td>
                            <td>{guest.guest_first_name}</td>
                            <td>{guest.guest_last_name}</td>
                            <td>{guest.start_date}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            );
        }

        if (reportType === 'receptionStats') {
            return (
                <table className="visits-table">
                    <thead>
                    <tr>
                        <th>Rodzaj</th>
                        <th>Wartość</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Object.entries(reportData).map(([key, value]) => (
                        <tr key={key}>
                            <td>{key}</td>
                            <td>{value}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            );
        }

        if (reportType === 'monthlyReport') {
            return (
                <table className="visits-table">
                    <thead>
                    <tr>
                        <th>Data</th>
                        <th>Liczba wizyt</th>
                    </tr>
                    </thead>
                    <tbody>
                    {reportData.map((entry, index) => (
                        <tr key={index}>
                            <td>{entry.start_date}</td>
                            <td>{entry.total}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            );
        }
    };

    return (
        <div className="container mt-4">
            <h2>Wybierz rodzaj raportu</h2>
            <Form className="mb-4">
                <Row className="mb-3">
                    <Col>
                        <Form.Group controlId="reportType" className="form-group">
                            <Form.Label>Rodzaj raportu</Form.Label>
                            <Form.Control as="select" value={reportType} onChange={handleReportTypeChange} className="form-control">
                                <option value="">-- Wybierz --</option>
                                <option value="guestList">Lista gości dla hosta</option>
                                <option value="receptionStats">Statystyki aktywności recepcji</option>
                                <option value="monthlyReport">Raport wizyt w wybranym okresie</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>

                {reportType === 'guestList' && (
                    <Row className="mb-3">
                        <Col>
                            <Form.Group controlId="userId" className="form-group">
                                <Form.Label>ID użytkownika</Form.Label>
                                <Form.Control type="text" value={userId} onChange={handleUserIdChange} className="form-control"/>
                            </Form.Group>
                        </Col>
                    </Row>
                )}

                {(reportType === 'receptionStats' || reportType === 'monthlyReport') && (
                    <Row className="mb-3">
                        <Col>
                            <Form.Group controlId="startDate" className="form-group">
                                <Form.Label>Data początkowa</Form.Label>
                                <DatePicker
                                    selected={startDate}
                                    onChange={date => setStartDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                    className="form-control"
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="endDate" className="form-group">
                                <Form.Label>Data końcowa</Form.Label>
                                <DatePicker
                                    selected={endDate}
                                    onChange={date => setEndDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                    className="form-control"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                )}

                <Button id="filter_btn" onClick={fetchReportData} className="btn btn-primary">Generuj raport</Button>
            </Form>

            {error && <div className="error">{error}</div>}

            {reportData && (
                <div>
                    <h3>Wyniki raportu</h3>
                    {renderTable()}
                </div>
            )}
        </div>
    );
};

export default ReportingComponent;
