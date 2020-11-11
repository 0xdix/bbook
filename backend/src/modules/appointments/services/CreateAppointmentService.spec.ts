import AppError from '@shared/errors/AppError';

import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import FakeNotificationsRepository from '../../notifications/repositories/fakes/FakeNotificationsRepository';
import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
import CreateAppointmentService from './CreateAppointmentService';

let fakeCacheProvider: FakeCacheProvider;
let fakeAppointmentsRepository: FakeAppointmentsRepository;
let fakeNotificationsRepository: FakeNotificationsRepository;
let createAppointment: CreateAppointmentService;

describe('CreateAppointment', () => {
	beforeEach(() => {
		fakeAppointmentsRepository = new FakeAppointmentsRepository();
		fakeCacheProvider = new FakeCacheProvider();
		fakeNotificationsRepository = new FakeNotificationsRepository();

		createAppointment = new CreateAppointmentService(
			fakeAppointmentsRepository,
			fakeNotificationsRepository,
			fakeCacheProvider,
		);
	});

	it('should be able to create a new appointment', async () => {
		jest.spyOn(Date, 'now').mockImplementationOnce(() => {
			return new Date(2020, 8, 21, 12).getTime();
		});

		const appointment = await createAppointment.execute({
			date: new Date(2020, 8, 21, 13),
			user_id: 'user-id',
			provider_id: '123123123',
		});

		expect(appointment).toHaveProperty('id');
		expect(appointment.provider_id).toBe('123123123');
	});

	it("shouldn't be able to create two appointments on the same hour", async () => {
		const appointmentDate = new Date(2020, 8, 22, 14);

		await createAppointment.execute({
			date: appointmentDate,
			user_id: 'user-id',
			provider_id: '123123123',
		});

		await expect(
			createAppointment.execute({
				date: appointmentDate,
				user_id: 'user-id',
				provider_id: '123123123',
			}),
		).rejects.toBeInstanceOf(AppError);
	});

	it("shouldn't be able to create an appointment on a past date", async () => {
		jest.spyOn(Date, 'now').mockImplementationOnce(() => {
			return new Date(2020, 8, 21, 12).getTime();
		});

		await expect(
			createAppointment.execute({
				date: new Date(2020, 8, 21, 11),
				user_id: 'user-id',
				provider_id: '123123123',
			}),
		).rejects.toBeInstanceOf(AppError);
	});

	it("shouldn't be able to create an appointment with same user as provider", async () => {
		jest.spyOn(Date, 'now').mockImplementationOnce(() => {
			return new Date(2020, 8, 21, 12).getTime();
		});

		await expect(
			createAppointment.execute({
				date: new Date(2020, 8, 21, 13),
				user_id: 'user-id',
				provider_id: 'user-id',
			}),
		).rejects.toBeInstanceOf(AppError);
	});

	it("shouldn't be able to create an appointment before 8am and after 5pm", async () => {
		jest.spyOn(Date, 'now').mockImplementationOnce(() => {
			return new Date(2020, 8, 21, 12).getTime();
		});

		await expect(
			createAppointment.execute({
				date: new Date(2020, 8, 22, 7),
				user_id: 'user-id',
				provider_id: 'provider-id',
			}),
		).rejects.toBeInstanceOf(AppError);

		await expect(
			createAppointment.execute({
				date: new Date(2020, 8, 22, 18),
				user_id: 'user-id',
				provider_id: 'provider-id',
			}),
		).rejects.toBeInstanceOf(AppError);
	});
});
