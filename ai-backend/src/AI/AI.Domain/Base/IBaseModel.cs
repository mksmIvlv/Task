namespace AI.Domain.Base;

public interface IBaseModel<T>
{
    public int Id { get; set; }
    public T Body { get; set; }
}