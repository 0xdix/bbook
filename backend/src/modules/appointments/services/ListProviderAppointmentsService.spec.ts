import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
import ListProviderAppointmentsService from './ListProviderAppointmentsService';

let fakeAppoitnmentsRepository: FakeAppointmentsRepository;
let fakeCacheProvider: FakeCacheProvider;
let listProviderAppointments: ListProviderAppointmentsService;

describe('ListProviderAppointments', () => {
	beforeEach(() => {
		fakeAppoitnmentsRepository = new FakeAppointmentsRepository();
		fakeCacheProvider = new FakeCacheProvider();

		listProviderAppointments = new ListProviderAppointmentsService(
			fakeAppoitnmentsRepository,
			fakeCacheProvider,
		);
	});

	it('should be able to list the appointments on a specific day', async () => {
		const appointment1 = await fakeAppoitnmentsRepository.create({
			provider_id: 'provider',
			user_id: 'user',
			date: new Date(2020, 8, 22, 14, 0, 0),
		});

		const appointment2 = await fakeAppoitnmentsRepository.create({
			provider_id: 'provider',
			user_id: 'user',
			date: new Date(2020, 8, 22, 15, 0, 0),
		});

		const appointments = await listProviderAppointments.execute({
			provider_id: 'provider',
			year: 2020,
			month: 9,
			day: 22,
		});

		expect(appointments).toEqual([appointment1, appointment2]);
	});
});
